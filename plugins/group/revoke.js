export default {
  name: "revoke",
  category: "Group",
  description: "Reset link grup",
  groupOnly: true,
  admin: true,
  botAdmin: true,
  async handle({ ctx, sock }) {
    await sock.groupRevokeInvite(ctx.chatId);
    const code = await sock.groupInviteCode(ctx.chatId);
    ctx.reply("✅ Link direset!\n🔗 https://chat.whatsapp.com/" + code);
  },
};
