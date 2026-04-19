import moment from "moment-timezone";
import fs from "fs";
import { contactQuoted } from "../../lib/fakeQuoted.js";
import { runtime, ucapan, imgResize } from "../../lib/tools.js";

const sc = (t) =>
  [...t.toLowerCase()]
    .map(
      (c) =>
        ({
          a: "ᴀ",
          b: "ʙ",
          c: "ᴄ",
          d: "ᴅ",
          e: "ᴇ",
          f: "ғ",
          g: "ɢ",
          h: "ʜ",
          i: "ɪ",
          j: "ᴊ",
          k: "ᴋ",
          l: "ʟ",
          m: "ᴍ",
          n: "ɴ",
          o: "ᴏ",
          p: "ᴘ",
          q: "ǫ",
          r: "ʀ",
          s: "s",
          t: "ᴛ",
          u: "ᴜ",
          v: "ᴠ",
          w: "ᴡ",
          x: "x",
          y: "ʏ",
          z: "ᴢ",
        })[c] || c,
    )
    .join("");

export default {
  name: "menu",
  category: "General",
  description: "Tampilkan menu bot",
  command: ["menu", "help"],
  async handle({ ctx, sock }) {
    const plugins = global.pluginLoader?.getAll() || new Map();
    const cats = {};
    for (const [, p] of plugins) {
      if (!p?.category || !p?.name) continue;
      const cat = p.category.toLowerCase();
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(p.name);
    }
    const user = global.db?.users?.[ctx.senderId] || {};
    const total = [...plugins.values()].filter(
      (p) => p?.name || (typeof p === "function" && p?.command),
    ).length;
    const pfx = ctx.prefix || ".";
    const arg = ctx.argsStr.trim().toLowerCase();

    if (arg === "all") {
      const lines = [];
      for (const cat of Object.keys(cats).sort()) {
        lines.push("╭<彡 *" + sc(cat) + "* (" + cats[cat].length + ") 彡>");
        for (const c of cats[cat]) lines.push("│乂 " + pfx + sc(c));
        lines.push("╰──────────");
      }
      lines.push("", "*ᴛᴏᴛᴀʟ: " + total + " ᴘᴇʀɪɴᴛᴀʜ*");
      return await sock.sendMessage(
        ctx.chatId,
        {
          image: { url: global.bot.media.banner },
          caption: lines.join("\n"),
          contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: global.bot.newsletterJid,
            },
            mentionedJid: [ctx.senderId],
            externalAdReply: {
              title: global.bot.name,
              body: "",
              thumbnailUrl: global.bot.media.banner,
              mediaType: 1,
              sourceUrl: global.bot.social.github,
            },
          },
          viewOnce: false,
          mimetype: "image/jpeg",
        },
        { quoted: contactQuoted(ctx) },
      );
    }

    if (arg && cats[arg]) {
      const cmds = cats[arg];
      const lines = [
        "╭<彡 *" + sc(arg) + "* 彡>",
        "│",
        ...cmds.map((c) => "│乂 " + pfx + sc(c)),
        "│",
        "╰<彡 *" + cmds.length + " ᴘᴇʀɪɴᴛᴀʜ* 彡>",
      ];
      return await sock.sendMessage(
        ctx.chatId,
        {
          image: { url: global.bot.media.banner },
          caption: lines.join("\n"),
          contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: global.bot.newsletterJid,
            },
            mentionedJid: [ctx.senderId],
            externalAdReply: {
              title: global.bot.name,
              body: "",
              thumbnailUrl: global.bot.media.banner,
              mediaType: 1,
              sourceUrl: global.bot.social.github,
            },
          },
          viewOnce: false,
          mimetype: "image/jpeg",
        },
        { quoted: contactQuoted(ctx) },
      );
    }

    if (arg && !cats[arg]) {
      return ctx.reply(
        "❌ ᴋᴀᴛᴇɢᴏʀɪ *" +
          sc(arg) +
          "* ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ.\n\n📋 ᴛᴇʀsᴇᴅɪᴀ: " +
          Object.keys(cats).sort().map(sc).join(", "),
      );
    }

    const rows = Object.keys(cats)
      .sort()
      .map((cat) => ({
        title: sc(cat),
        description: cats[cat].length + " " + sc("commands"),
        id: pfx + "menu " + cat,
      }));

    const text = [
      "ʜᴀʟᴏ " +
        sc(ctx.pushName) +
        " saya adalah `" +
        sc(global.bot.name) +
        "` sᴇʙᴜᴀʜ ᴀsɪsᴛᴇɴ ʙᴇʀʙᴀsɪs ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ.",
      "╭<彡 *ɪ ɴ ғ ᴏ ʀ ᴍ ᴀ ᴛ ɪ ᴏ ɴ* 彡>",
      "│乂 ʙᴏᴛ ɴᴀᴍᴇ : " + global.bot.name,
      "│乂 ᴜsᴇʀ     : " + ctx.pushName,
      "│乂 ʟɪᴍɪᴛ   : " + (user.limit ?? global.bot.limit.default),
      "│乂 ʟᴇᴠᴇʟ   : " + (user.level ?? 1),
      "│乂 ᴜᴘᴛɪᴍᴇ  : " + runtime(process.uptime()),
      "│乂 ᴛᴏᴛᴀʟ   : " + total + " ᴘᴇʀɪɴᴛᴀʜ",
      "│乂 ᴡᴀᴋᴛᴜ   : " +
        moment.tz(global.bot.timezone).format("HH:mm") +
        " WIB",
      "╰<彡 *ᴛʜᴀɴᴋ ʏᴏᴜ* 彡>",
    ].join("\n");

    const interactiveEnabled = global.bot?.features?.menuInteractive ?? true;

    const messagePayload = {
      image: { url: global.bot.media.banner },
      caption: text,
      jpegThumbnail: await imgResize(global.bot.media.icon2, 200, 200),
      document: fs.readFileSync("./lib/example.txt"),
      fileLength: 9999999999,
      pageCount: 100,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.bot.newsletterJid,
        },
        mentionedJid: [ctx.senderId],
        externalAdReply: {
          title: global.bot.name,
          body: "",
          thumbnailUrl: global.bot.media.banner2,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: global.bot.social.github,
        },
      },
      viewOnce: false,
      mimetype: "image/jpeg",
    };

    if (interactiveEnabled) {
      messagePayload.buttons = [
        {
          buttonId: "SELECT_MENU",
          buttonText: { displayText: sc("pilih kategori") },
          type: 4,
          nativeFlowInfo: {
            name: "single_select",
            paramsJson: JSON.stringify({
              title: sc("pilih kategori menu"),
              sections: [
                {
                  title: sc("kategori"),
                  rows,
                },
              ],
            }),
          },
        },
      ];
    }

    await sock.sendMessage(
      ctx.chatId,
      messagePayload,
      { quoted: contactQuoted(ctx) },
    );
  },
};