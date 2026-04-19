export default {
  name: "setmode",
  category: "Owner",
  description: "Ubah mode bot (self/public)",
  ownerAccess: true,
  async handle({ ctx }) {
    const mode = ctx.args[0]?.toLowerCase();
    if (!["self", "public"].includes(mode))
      return ctx.reply("❌ Gunakan: .setmode self | .setmode public");
    global.bot.features.selfMode = mode === "self";
    ctx.reply("✅ Mode bot: *" + mode.toUpperCase() + "*");
  },
};
