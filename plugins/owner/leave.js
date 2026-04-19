export default {
  name: "leave",
  category: "Owner",
  description: "Bot keluar dari grup",
  ownerAccess: true,
  groupOnly: true,
  command: ["leave", "leavegc"],
  async handle({ ctx, sock }) {
    await ctx.reply("👋 Bot keluar...");
    await sock.groupLeave(ctx.chatId);
  },
};
