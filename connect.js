import readline from 'readline';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { makeWASocket, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, Browsers, DisconnectReason, useMultiFileAuthState } from 'baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';
import { SerializeMessage } from './events/serialize-message.js';
import { CommandLoader } from './events/helper.js';
import { UpsertMsgHandle } from './handler.js';
import db from '#utils/database';

const question = (text) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(text, (ans) => { rl.close(); resolve(ans); }));
};

let RECONNECTABLE = new Set([
  DisconnectReason.connectionClosed,
  DisconnectReason.connectionLost,
  DisconnectReason.timedOut,
  DisconnectReason.restartRequired,
]);

let FATAL = new Set([
  DisconnectReason.loggedOut,
  DisconnectReason.badSession,
  DisconnectReason.multideviceMismatch,
]);

(async () => {
  const loader = new CommandLoader({ dir: path.join(process.cwd(), './events/commands'), logger: console });
  global.loader = loader;
  await loader.loadAll();
  loader.watch();
  console.log(chalk.green('✓ Command loader siap dengan', Object.values(loader.getCommandsByCategory()).flat().length, 'commands'));
  console.log(chalk.yellow('⏳ Memulai koneksi WhatsApp...'));
  global.db = {
    user: db.read().user || {},
    group: db.read().group || {},
    cmd: db.read().cmd || {},
  }

  let selectedPairing = null;

  const start = async () => {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const isRegistered = state.creds.registered;

    if (!isRegistered && selectedPairing === null) {
      const mode = await question(
        chalk.gray('?') + chalk.whiteBright.underline(' Apakah anda ingin memakai ') +
        chalk.cyanBright('"pairing" ') + chalk.greenBright('[yes/no]: ')
      );
      selectedPairing = mode.trim().toLowerCase() === 'yes';
    }

    const pairing = !isRegistered && (selectedPairing ?? false);

    const fuqi = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      browser: Browsers.ubuntu('Chrome'),
      logger: pino({ level: 'silent' }),
      generateHighQualityLinkPreview: true,
      keepAliveIntervalMs: 30_000,
      markOnlineOnConnect: true,
    });

    if (pairing) {
      const number = await question(
        chalk.gray('?') + chalk.whiteBright.underline(' Anda harus memasukkan ') +
        chalk.cyanBright('"nomor" ') + chalk.greenBright('yang aktif: ')
      );
      const code = await fuqi.requestPairingCode(number.replace(/\D/g, ''));
      console.log(chalk.greenBright('Kode Pairing Anda: ') + chalk.bold.whiteBright(code));
    }

    fuqi.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        try {
          const ctx = await SerializeMessage(fuqi, msg);
          if (!ctx) continue;
          ctx.loader = loader;
          const jid = msg.key.remoteJid;
          if (msg.key.id.startsWith("YUKI") || msg.key.id.startsWith("SUKI")) return
          if (jid.endsWith('@broadcast') || jid.endsWith('@newsletter')) continue;
          await UpsertMsgHandle(fuqi, msg, ctx, { cmd: loader });
        } catch (err) {
          console.error(chalk.redBright('[ MSG ERROR ]'), err.message);
        }
      }
    });

    fuqi.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      if (qr && !isRegistered && !pairing) {
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error
          ? new Boom(lastDisconnect.error).output.statusCode
          : undefined;

        if (FATAL.has(reason)) {
          console.log(chalk.redBright('[ CONNECTION ]') + chalk.whiteBright(' Session rusak / logout. Menghapus session...'));
          await fs.promises.rm('./session', { recursive: true, force: true });
          selectedPairing = null;
          return start();
        }

        if (reason === DisconnectReason.connectionReplaced) {
          console.log(chalk.yellowBright('[ CONNECTION ]') + chalk.whiteBright(' Session digunakan di device lain.'));
          return;
        }

        if (RECONNECTABLE.has(reason) || reason !== undefined) {
          console.log(chalk.greenBright('[ CONNECTION ]') + chalk.whiteBright(' Terputus. Menyambungkan ulang...'));
          return start();
        }
      }

      if (connection === 'open') {
        const jid = fuqi.user?.id?.split(':')[0] ?? fuqi.user?.id;
        console.log(chalk.cyanBright('[ CONNECTION ]') + chalk.whiteBright(' Berhasil terhubung sebagai ') + chalk.bold(jid));
      }
    });

    fuqi.ev.on('creds.update', saveCreds);
  };

  await start();
})();