import { rand } from "../../lib/tools.js";

export default {
  name: "jadian",
  category: "Fun",
  description: "Prediksi jadian",
  async handle({ ctx }) {
    const who = ctx.mentionedJid?.[0];
    const name = who ? who.split("@")[0] : ctx.argsStr.trim();
    if (!name) return ctx.reply("❌ Tag seseorang atau tulis nama.");
    const pct = rand(0, 100);
    const hearts =
      "💗".repeat(Math.floor(pct / 20)) + "🤍".repeat(5 - Math.floor(pct / 20));
    const label =
      pct >= 80
        ? "Sudah pasti jadian! 💍"
        : pct >= 60
          ? "Sangat mungkin 💖"
          : pct >= 40
            ? "Ada kesempatan 💛"
            : pct >= 20
              ? "Susah 😅"
              : "Tidak mungkin 💀";
    ctx.reply(
      "┏━━━〔 *JADIAN METER* 〕━━━┓\n┃\n┃ 👤 " +
        ctx.pushName +
        "  +  " +
        name +
        "\n┃\n┃ " +
        hearts +
        "\n┃ *" +
        pct +
        "% — " +
        label +
        "*\n┗━━━━━━━━━━━━━━━━━━━━┛",
    );
  },
};
