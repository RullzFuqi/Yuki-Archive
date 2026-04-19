import stringSimilarity from "string-similarity";
import logger from "./lib/logger.js";
import db from "./lib/database.js";
import { formatDur, slugify } from "./lib/tools.js";
let msgCache = new Map();

function ensureUser(jid, name) {
  if (global.db.users[jid]) return;
  global.db.users[jid] = {
    name,
    banned: false,
    premium: { on: false, expiredAt: 0 },
    limit: global.bot?.limit?.default ?? 25,
    exp: 0,
    level: 1,
    afk: -1,
    afkReason: "",
    createdAt: Date.now(),
  };
}

function ensureGroup(id) {
  if (global.db.groups[id]) return;
  global.db.groups[id] = {
    id,
    isBanned: false,
    welcome: false,
    antiLink: false,
    delete: false,
    sWelcome: "",
    sBye: "",
    warnLink: {},
    autoAi: false,
  };
}

const getGroupMeta = async (sock, id) => {
  try {
    return await sock.groupMetadata(id);
  } catch {
    return null;
  }
};
const isAdmin = (meta, jid) =>
  meta?.participants?.some(
    (p) => p.id === jid && ["admin", "superadmin"].includes(p.admin),
  ) || false;
const isBotAdmin = (meta, sock) => {
  const b = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
  return (
    meta?.participants?.some(
      (p) => p.id === b && ["admin", "superadmin"].includes(p.admin),
    ) || false
  );
};

export async function handler(sock, msg, ctx) {
  try {
    if (msg.key?.id) {
      msgCache.set(msg.key.id, msg);
      if (msgCache.size > 500) {
        let firstKey = msgCache.keys().next().value;
        msgCache.delete(firstKey);
      }
    }
    global.msgCache = msgCache;
    if (!ctx?.chatId || ctx.isBaileys) return;
    if (ctx.chatId.endsWith("@broadcast") || ctx.chatId.endsWith("@newsletter"))
      return;
    if (global.bot?.features?.selfMode && !ctx.fromMe) return;

    ensureUser(ctx.senderId, ctx.pushName);
    if (ctx.isGroup) ensureGroup(ctx.chatId);

    const user = global.db.users[ctx.senderId];
    const group = ctx.isGroup ? global.db.groups[ctx.chatId] : null;

    if (
      ctx.chatId === "status@broadcast" &&
      global.bot?.features?.statusReact &&
      !ctx.fromMe
    ) {
      const e = ["😍", "🔥", "💯", "🤩", "😭", "👏", "❤️"];
      sock.sendMessage(
        ctx.chatId,
        {
          react: {
            key: msg.key,
            text: e[Math.floor(Math.random() * e.length)],
          },
        },
        { statusJid: [msg.key.participant] },
      );
      return;
    }

    if (group?.isBanned) return;
    if (user?.banned && !ctx.fromMe) return;

    if (!ctx.fromMe && ctx.text) {
      user.exp = (user.exp || 0) + Math.ceil(Math.random() * 8);
      db.write("users");
    }

    if (user?.afk >= 0 && !ctx.fromMe) {
      ctx.reply(
        "👋 Kamu kembali dari AFK!\n✏️ *" +
          (user.afkReason || "tidak ada") +
          "*\n⏱️ *" +
          formatDur(Date.now() - user.afk) +
          "*",
      );
      user.afk = -1;
      user.afkReason = "";
      db.write("users");
    }

    if (ctx.isGroup && ctx.mentionedJid?.length) {
      for (const jid of ctx.mentionedJid) {
        const u = global.db.users[jid];
        if (u?.afk >= 0)
          ctx.reply(
            "⚠️ @" +
              jid.split("@")[0] +
              " sedang *AFK*\n✏️ " +
              (u.afkReason || "-") +
              "\n⏱️ " +
              formatDur(Date.now() - u.afk),
          );
      }
    }

    if (ctx.isGroup && group?.antiLink && !ctx.fromMe) {
      const meta = await getGroupMeta(sock, ctx.chatId);
      if (
        isBotAdmin(meta, sock) &&
        !isAdmin(meta, ctx.senderId) &&
        !global.bot?.isOwner(ctx.senderId)
      ) {
        if (
          /(https?:\/\/[^\s]+|chat\.whatsapp\.com\/[^\s]+)/gi.test(ctx.text)
        ) {
          sock.sendMessage(ctx.chatId, { delete: msg.key });
          if (!group.warnLink) group.warnLink = {};
          const k = ctx.chatId + ":" + ctx.senderId;
          group.warnLink[k] = (group.warnLink[k] || 0) + 1;
          const w = group.warnLink[k];
          ctx.reply(
            "⚠️ *Peringatan " +
              w +
              "/3* — @" +
              ctx.senderId.split("@")[0] +
              " dilarang kirim link!",
          );
          if (w >= 3) {
            sock
              .groupParticipantsUpdate(ctx.chatId, [ctx.senderId], "remove")
              .catch(() => {});
            sock.sendMessage(ctx.chatId, {
              text:
                "🚫 @" +
                ctx.senderId.split("@")[0] +
                " di-kick karena 3x antilink.",
              contextInfo: { mentionedJid: [ctx.senderId] },
            });
            delete group.warnLink[k];
          }
          db.write("groups");
          return;
        }
      }
    }

    if (ctx.isGroup && !ctx.fromMe && !ctx.isCmd && group) {
      let stanzaId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
      const quotedSender = ctx.quotedSender;
      let isReplyToBot =
        (stanzaId && stanzaId.startsWith("YUKI")) || quotedSender === sock.user.id?.split(":")[0];
      if (isReplyToBot && group.autoAi) {
        try {
          console.log("[ Auto AI ] " + chalk.greenBright(ctx.senderId) + `\n${ctx.text?.trim()}`);
          if (ctx.text?.trim()) {
            const payload = {
              text: ctx.text?.trim(),
              id: ctx.senderId,
              fullainame: "Bella AI",
              nickainame: "Bella",
              senderName: ctx.pushName || "User",
              date: new Date().toISOString(),
              role: "Temen ngobrol",
            };
            let res = await axios.post(
              "https://api.termai.cc/api/chat/logic-bell?key=" + global.bot?.api?.termai || "Bell409",
              payload,
              {
                headers: {
                  "Content-Type": "application/json",
                },
                timeout: 15000,
              },
            );

            console.log("[ Auto AI ] " + chalk.greenBright(res.data));
            if (res.data?.data?.msg) {
              await sock.sendMessage(
                ctx.chatId,
                { text: res.data?.data?.msg },
                { quoted: msg },
              );
              return;
            } else {
              console.log("[ Auto AI ] " + chalk.redBright("Tidak ada jawaban dari API"));
            }
          } else {
            console.log("[ Auto AI ] " + chalk.yellowBright("Pertanyaan kosong."));
          }
        } catch (err) {
          console.log("[ Auto AI ] " +chalk.redBright("Ai Error."));
          console.log("Message:", err.message);
          console.log("Response:", err.response?.data);
          console.log("Status:", err.response?.status);
        }
      }
    }

    if (ctx.text && !ctx.isCmd) {
      const key = slugify(ctx.text);
      if (global.db.response?.[key]) {
        try {
          await sock.relayMessage(ctx.chatId, global.db.response[key], {
            messageId: sock.generateMessageTag(),
          });
        } catch {}
        return;
      }
    }

    const plugins = global.pluginLoader?.getAll();
    if (!plugins) return;

    const _owner = global.bot?.isOwner(ctx.senderId) || ctx.fromMe;
    const _prem = (() => {
      if (_owner) return true;
      const u = global.db.users[ctx.senderId];
      if (!u?.premium?.on) return false;
      if (u.premium.expiredAt && Date.now() > u.premium.expiredAt) return false;
      return true;
    })();
    const _noLimit = _owner || _prem;

    let matched = false;

    for (const [, plugin] of plugins) {
      if (!plugin || plugin.disabled) continue;

      if (typeof plugin.before === "function") {
        try {
          if (await plugin.before.call(sock, msg, ctx)) continue;
        } catch {}
      }
      if (typeof plugin.all === "function") {
        try {
          await plugin.all.call(sock, msg, ctx);
        } catch (e) {
          logger.error("all:", e.message);
        }
        continue;
      }

      const isNew =
        typeof plugin === "object" && typeof plugin.handle === "function";
      const isOld = typeof plugin === "function";
      if (!isNew && !isOld) continue;
      if (!ctx.command) continue;

      const matchCmd = (p) => {
        const cmd =
          p.command ||
          (p.name
            ? new RegExp("^" + p.name.split("|").join("|") + "$", "i")
            : null);
        if (!cmd) return false;
        return cmd instanceof RegExp
          ? cmd.test(ctx.command)
          : Array.isArray(cmd)
            ? cmd.some((c) =>
                c instanceof RegExp ? c.test(ctx.command) : c === ctx.command,
              )
            : cmd === ctx.command;
      };
      if (!matchCmd(plugin)) continue;

      matched = true;

      if ((plugin.ownerAccess || plugin.rowner) && !_owner) {
        ctx.reply("❌ Hanya *Owner* yang bisa gunakan ini.");
        continue;
      }
      if ((plugin.premiumAccess || plugin.premium) && !_prem) {
        ctx.reply("❌ Fitur ini khusus *Premium*.");
        continue;
      }
      if ((plugin.groupOnly || plugin.group) && !ctx.isGroup) {
        ctx.reply("❌ Hanya bisa di *Grup*.");
        continue;
      }
      if ((plugin.privateOnly || plugin.private) && ctx.isGroup) {
        ctx.reply("❌ Hanya bisa di *Chat Pribadi*.");
        continue;
      }

      if (ctx.isGroup) {
        const meta = await getGroupMeta(sock, ctx.chatId);
        if (plugin.botAdmin && !isBotAdmin(meta, sock)) {
          ctx.reply("❌ Bot harus menjadi *Admin Grup*.");
          continue;
        }
        if (plugin.admin && !isAdmin(meta, ctx.senderId)) {
          ctx.reply("❌ Hanya *Admin Grup* yang bisa.");
          continue;
        }
      }

      const cost = plugin.limit ?? plugin.limitRequired ?? 0;
      if (cost && !_noLimit) {
        if ((user.limit || 0) < cost) {
          ctx.reply(
            "❌ Limit harian habis!\n📊 Punya: " +
              user.limit +
              " | Butuh: " +
              cost,
          );
          continue;
        }
        user.limit -= cost;
        db.write("users");
      }

      global.db.stats[ctx.command] = (global.db.stats[ctx.command] || 0) + 1;
      user.exp = (user.exp || 0) + (plugin.exp || 10);
      db.write("stats");
      db.write("users");

      logger.cmd(ctx.senderId, (ctx.prefix || "") + ctx.command, ctx.isGroup);
      sock.sendPresenceUpdate("composing", ctx.chatId).catch(() => {});

      try {
        if (isNew) {
          await plugin.handle({
            ctx,
            sock,
            msg,
            db,
            isOwner: _owner,
            isPremium: _prem,
          });
        } else {
          await plugin.call(sock, msg, ctx);
        }
      } catch (e) {
        logger.error("[" + ctx.command + "] " + e.message);
        ctx.reply("❌ Error: " + e.message);
      }
      break;
    }

    if (
      !matched &&
      ctx.command &&
      !ctx.fromMe &&
      global.bot?.features?.cmdSuggest
    ) {
      const all = [...plugins.values()]
        .flatMap((p) => {
          if (p?.name) return [p.name];
          const cmd = typeof p === "function" ? p?.command : null;
          if (!cmd || cmd instanceof RegExp) return [];
          return Array.isArray(cmd) ? cmd : [cmd];
        })
        .filter((c) => typeof c === "string");
      if (all.length) {
        const best = stringSimilarity.findBestMatch(ctx.command, all);
        if (best.bestMatch.rating >= 0.4)
          ctx.reply(
            "❓ Command *" +
              (ctx.prefix || ".") +
              ctx.command +
              "* tidak ditemukan.\n💡 Mungkin: *" +
              (ctx.prefix || ".") +
              best.bestMatch.target +
              "*",
          );
      }
    }
  } catch (e) {
    logger.error("handler:", e.message);
  }
}

export async function participantsUpdate(sock, { id, action, participants }) {
  const grp = global.db.groups?.[id];
  if (!grp?.welcome) return;
  for (const p of participants) {
    const jid = typeof p === "string" ? p : p.id;
    let meta;
    try {
      meta = await sock.groupMetadata(id);
    } catch {}
    const fill = (t) =>
      t
        .replace(/@user/g, "@" + jid.split("@")[0])
        .replace(/@subject/g, meta?.subject || "")
        .replace(/@count/g, String(meta?.participants?.length || 0));
    const txt = {
      add: fill(grp.sWelcome || "Selamat datang @user! 👋"),
      remove: fill(grp.sBye || "Sampai jumpa @user! 👋"),
      promote: fill("⚡ @user sekarang *Admin*!"),
      demote: fill("📉 @user bukan *Admin* lagi."),
    };
    if (txt[action])
      sock
        .sendMessage(id, {
          text: txt[action],
          contextInfo: { mentionedJid: [jid] },
        })
        .catch(() => {});
  }
}

export async function groupsUpdate(sock, updates) {
  for (const u of updates) {
    const grp = global.db.groups?.[u.id];
    if (!grp) continue;
    if (u.announce === true)
      sock.sendMessage(u.id, { text: "🔒 Grup *ditutup*" }).catch(() => {});
    if (u.announce === false)
      sock.sendMessage(u.id, { text: "🔓 Grup *dibuka*" }).catch(() => {});
  }
}

export async function deleteUpdate(sock, { keys }) {
  for (const key of Array.isArray(keys) ? keys : [keys]) {
    const grp = global.db.groups?.[key.remoteJid];
    if (!grp?.delete) continue;
    const who = key.participant || key.remoteJid;
    sock
      .sendMessage(key.remoteJid, {
        text: "🗑️ Pesan dihapus @" + who.split("@")[0],
        contextInfo: { mentionedJid: [who] },
      })
      .catch(() => {});
  }
}
