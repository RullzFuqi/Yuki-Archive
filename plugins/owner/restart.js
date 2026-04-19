export default {
  name: "restart",
  category: "Owner",
  description: "Restart bot",
  ownerAccess: true,
  async handle({ ctx }) {
    await ctx.reply("🔄 Restarting...");
    setTimeout(() => process.exit(0), 1500);
  },
};
