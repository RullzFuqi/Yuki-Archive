export default {
  name: "add",
  category: "Group",
  description: "Tambah member ke grup",
  groupOnly: true,
  admin: true,
  botAdmin: true,
  async handle({ ctx, sock }) {
    const num = ctx.argsStr.replace(/\D/g, "");
    if (!num) return ctx.reply("❌ Masukkan nomor.\nContoh: .add 628xxx");
    await sock.groupParticipantsUpdate(
      ctx.chatId,
      [num + "@s.whatsapp.net"],
      "add",
    );
    ctx.reply("✅ Request add ke *+" + num + "*");
  },
};
