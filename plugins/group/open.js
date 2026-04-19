export default {
  name: "opengroup",
  category: "Group",
  description: "Buka grup (semua bisa chat)",
  groupOnly: true,
  admin: true,
  botAdmin: true,
  command: ["opengroup", "open"],
  async handle({ ctx, sock }) {
    await sock.groupSettingUpdate(ctx.chatId, "not_announcement");
    ctx.reply("🔓 Grup *dibuka*.");
  },
};
