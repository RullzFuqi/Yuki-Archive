import { rand } from "../../lib/tools.js";

export default {
  name: "apakah",
  category: "Fun",
  description: "Apakah pertanyaanmu?",
  async handle({ ctx }) {
    if (!ctx.hasArgs) return ctx.reply("❌ .apakah <pertanyaan>");
    const pct = rand(0, 100);
    const bar =
      "█".repeat(Math.floor(pct / 10)) + "░".repeat(10 - Math.floor(pct / 10));
    ctx.reply("🔮 *" + ctx.argsStr + "?*\n\n[" + bar + "] *" + pct + "%*");
  },
};
