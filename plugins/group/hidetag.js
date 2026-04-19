export default {
  name: "hidetag",
  category: "Group",
  description: "Tag semua member tanpa terlihat",
  groupOnly: true,
  admin: true,
  command: ["hidetag", "ht"],
  async handle({ ctx, sock }) {
    const meta = await sock.groupMetadata(ctx.chatId);
    const m = meta.participants.map((p) => p.id);
    const text = ctx.argsStr || ctx.quotedText;
    if (!text) return ctx.reply("❌ Masukkan pesan atau reply pesan.");
    await sock.sendMessage(
      ctx.chatId,
      { text, mentions: m },
      { quoted: ctx._msg },
    );
  },
};
