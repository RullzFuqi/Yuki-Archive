import "./config.js";
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  DisconnectReason,
} from "baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import fs from "fs";
import readline from "readline";
import qrcode from "qrcode-terminal";
import chalk from "chalk";
import db from "./lib/database.js";
import Loader from "./lib/loader.js";
import { serialize } from "./lib/serialize.js";
import {
  handler,
  participantsUpdate,
  groupsUpdate,
  deleteUpdate,
} from "./handler.js";
import logger from "./lib/logger.js";

db.init();
global.pluginLoader = new Loader("./plugins");

const FATAL = new Set([
  DisconnectReason.loggedOut,
  DisconnectReason.badSession,
  DisconnectReason.multideviceMismatch,
]);

const ask = (q) =>
  new Promise((r) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(q, (a) => {
      rl.close();
      r(a.trim());
    });
  });

setInterval(() => db.write(), 60_000);

setInterval(() => {
  const today = new Date().toDateString();
  if (global._lastReset === today) return;
  const def = global.bot?.limit?.default ?? 25;
  let n = 0;
  for (const u of Object.values(global.db.users || {})) {
    if ((u.limit || 0) < def) {
      u.limit = def;
      n++;
    }
  }
  global._lastReset = today;
  db.write("users");
  if (n) logger.ok("Limit reset: " + n + " user(s)");
}, 60_000);

setInterval(() => {
  const dir = "./tmp";
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    try {
      const fp = dir + "/" + f;
      if (Date.now() - fs.statSync(fp).mtimeMs > 5 * 60_000) fs.unlinkSync(fp);
    } catch {}
  }
}, 5 * 60_000);

let selectedPairing = null;

async function start() {
  await global.pluginLoader.loadAll();
  global.pluginLoader.watch(".");

  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const isReg = state.creds.registered;

  if (!isReg && selectedPairing === null) {
    const ans = await ask(
      chalk.gray("?") +
        chalk.white(" Pairing code? ") +
        chalk.green("[yes/no]: "),
    );
    selectedPairing = ans.toLowerCase() === "yes";
  }

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    },
    browser: Browsers.ubuntu("Chrome"),
    logger: pino({ level: "silent" }),
    generateHighQualityLinkPreview: true,
    keepAliveIntervalMs: 30_000,
    printQRInTerminal: !(selectedPairing || isReg),
  });

  global.sock = sock;

  if (!isReg && selectedPairing) {
    const num = await ask(
      chalk.gray("?") + chalk.white(" Nomor WA (tanpa +): "),
    );
    const code = await sock.requestPairingCode(num.replace(/\D/g, ""));
    console.log(
      chalk.bgGreen.black(" PAIRING CODE ") + " " + chalk.bold.white(code),
    );
  }

  sock.ev.on(
    "connection.update",
    async ({ connection, lastDisconnect, qr }) => {
      if (qr && !selectedPairing && !isReg)
        qrcode.generate(qr, { small: true });
      if (connection === "connecting") logger.conn("Menghubungkan...");
      if (connection === "open")
        logger.conn("Connected — " + chalk.bold(sock.user?.id?.split(":")[0]));
      if (connection === "close") {
        const code = lastDisconnect?.error
          ? new Boom(lastDisconnect.error).output.statusCode
          : 0;
        if (FATAL.has(code)) {
          logger.conn("Session rusak, menghapus...");
          await fs.promises.rm("./session", { recursive: true, force: true });
          selectedPairing = null;
          return start();
        }
        if (code === DisconnectReason.connectionReplaced) {
          logger.conn("Session dipakai device lain.");
          return;
        }
        logger.conn("Terputus, reconnecting...");
        return start();
      }
    },
  );

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      try {
        const ctx = serialize(sock, msg);
        if (!ctx) continue;
        await handler(sock, msg, ctx);
      } catch (e) {
        logger.error("upsert:", e.message);
      }
    }
  });

  sock.ev.on("group-participants.update", (u) =>
    participantsUpdate(sock, u).catch(() => {}),
  );
  sock.ev.on("groups.update", (u) => groupsUpdate(sock, u).catch(() => {}));
  sock.ev.on("message.delete", (u) => deleteUpdate(sock, u).catch(() => {}));

  sock.ev.on("call", (calls) => {
    if (!global.bot?.features?.antiCall) return;
    for (const c of Array.isArray(calls) ? calls : [calls]) {
      if (c.status !== "offer") continue;
      sock.rejectCall(c.id, c.from).catch(() => {});
      sock
        .sendMessage(c.from, { text: "📵 Panggilan tidak diterima." })
        .catch(() => {});
    }
  });
}

start().catch((e) => {
  logger.error("start:", e.message);
  console.error(e);
});
