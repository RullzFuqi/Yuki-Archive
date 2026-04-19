import { rand } from "../../lib/tools.js";

export default {
  name: "ship",
  category: "Fun",
  description: "Cek kecocokan dua nama",
  async handle({ ctx }) {
    const parts = ctx.argsStr.split(",");
    const p1 = parts[0]?.trim() || "",
      p2 = parts[1]?.trim() || ctx.mentionedJid?.[0]?.split("@")[0] || "???";
    if (!p1) return ctx.reply("❌ .ship Nama1, Nama2");
    const pct = rand(0, 100);
    const bar =
      "💗".repeat(Math.floor(pct / 20)) + "🤍".repeat(5 - Math.floor(pct / 20));
    const l =
      pct >= 80
        ? "💍 PERFECT!"
        : pct >= 60
          ? "💖 Cocok!"
          : pct >= 40
            ? "💛 Lumayan"
            : pct >= 20
              ? "💔 Kurang"
              : "😬 Tidak";
    ctx.reply(
      "💘 *Ship Meter*\n\n" +
        p1 +
        " + " +
        p2 +
        "\n\n" +
        bar +
        "\n*" +
        pct +
        "% — " +
        l +
        "*",
    );
  },
};
