export default {
  name: "tagall",
  category: "Group",
  description: "Tag semua member grup",
  groupOnly: true,
  admin: true,
  command: ["tagall", "mentionall"],
  async handle({ ctx, sock }) {
    const meta = await sock.groupMetadata(ctx.chatId);
    const m = meta.participants.map((p) => p.id);
    await sock.sendMessage(
      ctx.chatId,
      {
        text:
          (ctx.argsStr || "📢 Tagall!") +
          "\n\n" +
          m.map((j) => "@" + j.split("@")[0]).join(" "),
        mentions: m,
      },
      { quoted: ctx._msg },
    );
  },
};
