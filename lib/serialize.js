import {
  jidNormalizedUser,
  getContentType,
  extractMessageContent,
  downloadContentFromMessage,
} from "baileys";
import { contactQuoted } from "./fakeQuoted.js";
function decodeJID(sock, jid) {
  if (!jid) return jid;
  try {
    if (jid.endsWith("@s.whatsapp.net")) return jidNormalizedUser(jid);
    const pn = sock.signalRepository?.lidMapping?.getPNForLid?.(jid);
    return pn ? jidNormalizedUser(pn) : jidNormalizedUser(jid);
  } catch {
    return jidNormalizedUser(jid);
  }
}

export function serialize(sock, msg) {
  if (!msg?.message) return null;
  const m = extractMessageContent(msg.message);
  if (!m) return null;

  const ctx = {};
  ctx.id = msg.key.id;
  ctx.chatId = jidNormalizedUser(msg.key.remoteJid);
  ctx.isGroup = ctx.chatId.endsWith("@g.us");
  ctx.senderId = ctx.isGroup
    ? decodeJID(sock, msg.key.participantAlt || msg.key.participant)
    : decodeJID(sock, msg.key.remoteJid || msg.key.remoteJidAlt);
  ctx.pushName = msg.pushName || "User";
  ctx.fromMe = msg.key.fromMe || false;
  ctx.isBaileys = /^(YUKI|3EB)/.test(ctx.id || "");
  ctx.timestamp = Number(msg.messageTimestamp) * 1000;
  ctx.type = getContentType(msg.message);
  ctx._msg = msg;

  ctx.text = (() => {
    const flow = m?.interactiveResponseMessage?.nativeFlowResponseMessage;
    if (flow?.paramsJson) {
      try {
        const p = JSON.parse(flow.paramsJson);
        return typeof p === "string" ? p : p?.id || "";
      } catch {}
    }
    return (
      m?.conversation ||
      m?.extendedTextMessage?.text ||
      m?.imageMessage?.caption ||
      m?.videoMessage?.caption ||
      m?.documentMessage?.caption ||
      m?.buttonsResponseMessage?.selectedButtonId ||
      m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
      ""
    );
  })();

  const ci =
    m?.extendedTextMessage?.contextInfo ||
    m?.imageMessage?.contextInfo ||
    m?.videoMessage?.contextInfo ||
    m?.documentMessage?.contextInfo ||
    m?.stickerMessage?.contextInfo ||
    null;
  ctx.mentionedJid = Array.isArray(ci?.mentionedJid)
    ? ci.mentionedJid.map((j) => decodeJID(sock, j)).filter(Boolean)
    : [];
  ctx.isQuoted = !!ci?.quotedMessage;
  ctx.quoted = ci?.quotedMessage || null;
  ctx.quotedType = ctx.quoted ? getContentType(ctx.quoted) : null;
  ctx.quotedSender = ci?.participant ? decodeJID(sock, ci.participant) : null;
  ctx.quotedText = ctx.quoted
    ? ctx.quoted[ctx.quotedType]?.text ||
      ctx.quoted[ctx.quotedType]?.caption ||
      ctx.quoted?.conversation ||
      ""
    : "";

  const mc = m[ctx.type] || {};
  ctx.mimetype = mc?.mimetype || null;
  ctx.isMedia = /image|video|sticker|audio|document/.test(ctx.mimetype || "");
  ctx.mediaType = ctx.isMedia
    ? ctx.type?.replace("Message", "").toLowerCase()
    : null;

  const pfx = global.bot?.prefix?.exec?.(ctx.text.trim());
  ctx.prefix = pfx ? pfx[0] : null;
  ctx.command = ctx.prefix
    ? ctx.text.trim().slice(ctx.prefix.length).split(/\s+/)[0].toLowerCase()
    : null;
  ctx.args = ctx.prefix ? ctx.text.trim().split(/\s+/).slice(1) : [];
  ctx.argsStr = ctx.args.join(" ");
  ctx.hasArgs = ctx.args.length > 0;
  ctx.isCmd = !!ctx.command;

  ctx.reply = (text, opts = {}) =>
    sock.sendMessage(ctx.chatId, { text, ...opts }, { quoted: msg });
  ctx.react = (emoji) =>
    sock.sendMessage(ctx.chatId, { react: { text: emoji, key: msg.key } });
  ctx.delete = () => sock.sendMessage(ctx.chatId, { delete: msg.key });
  ctx.edit = (text) => sock.sendMessage(ctx.chatId, { text, edit: msg.key });

  ctx.adReply = (imgUrl, text, opts = {}) =>
    sock.sendMessage(
      ctx.chatId,
      {
        text,
        ...opts,
        contextInfo: {
          mentionedJid: [ctx.senderId],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid:
              global.bot?.newsletterJid || "120363393144098629@newsletter",
            newsletterName: global.bot?.name || "Bot",
          },
          externalAdReply: {
            title: global.bot?.name || "Bot",
            body: "",
            thumbnailUrl: imgUrl || global.bot?.media?.banner || "",
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: global.bot?.social?.github || "",
          },
        },
      },
      { quoted: contactQuoted(ctx) },
    );

  ctx.download = async () => {
    const content = m[ctx.type];
    if (!content) throw new Error("No media");
    const stream = await downloadContentFromMessage(
      content,
      ctx.mediaType || "document",
    );
    const chunks = [];
    for await (const c of stream) chunks.push(c);
    return Buffer.concat(chunks);
  };

  ctx.downloadQuoted = async () => {
    if (!ctx.quoted || !ctx.quotedType) throw new Error("No quoted media");
    const content = ctx.quoted[ctx.quotedType];
    if (!content) throw new Error("No content");
    const stream = await downloadContentFromMessage(
      content,
      ctx.quotedType.replace("Message", "").toLowerCase(),
    );
    const chunks = [];
    for await (const c of stream) chunks.push(c);
    return Buffer.concat(chunks);
  };

  return ctx;
}
