export default {
  name: "link",
  category: "Group",
  description: "Ambil link undangan grup",
  groupOnly: true,
  admin: true,
  async handle({ ctx, sock }) {
    const code = await sock.groupInviteCode(ctx.chatId);
    ctx.reply("🔗 https://chat.whatsapp.com/" + code);
  },
};
