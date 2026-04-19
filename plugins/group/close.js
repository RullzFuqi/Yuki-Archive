export default {
  name: "closegroup",
  category: "Group",
  description: "Tutup grup (hanya admin bisa chat)",
  groupOnly: true,
  admin: true,
  botAdmin: true,
  command: ["closegroup", "close"],
  async handle({ ctx, sock }) {
    await sock.groupSettingUpdate(ctx.chatId, "announcement");
    ctx.reply("🔒 Grup *ditutup*.");
  },
};
