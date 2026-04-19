export default {
  name: "calc",
  category: "Tools",
  description: "Kalkulator",
  command: ["calc", "hitung"],
  async handle({ ctx }) {
    const expr = ctx.argsStr.trim() || ctx.quotedText;
    if (!expr) return ctx.reply("❌ .calc <ekspresi>");
    try {
      const r = Function('"use strict"; return (' + expr + ")")();
      ctx.reply("🔢 `" + expr + "` = *" + r + "*");
    } catch (e) {
      ctx.reply("❌ " + e.message);
    }
  },
};
