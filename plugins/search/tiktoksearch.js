import axios from "axios";

export default {
  name: "ttsearch",
  category: "Search",
  description: "Cari video di TikTok",
  command: ["ttsearch", "tiktoksearch"],
  async handle({ ctx }) {
    if (!ctx.hasArgs) return ctx.reply("❌ .ttsearch <kata kunci>");
    await ctx.react("⏳");
    try {
      const key = global.bot?.api?.termai || "Bell409";
      const res = await axios.get(
        "https://api.termai.cc/api/search/tiktok?q=" +
          encodeURIComponent(ctx.argsStr) +
          "&key=" +
          key,
        { timeout: 15000 },
      );
      const list = res.data?.result || res.data?.data || [];
      if (!list.length) return ctx.reply("❌ Tidak ditemukan.");
      const lines = ["┏━━━〔 *TIKTOK SEARCH* 〕━━━┓", "┃"];
      list
        .slice(0, 5)
        .forEach((v, i) =>
          lines.push(
            "┃ " +
              (i + 1) +
              ". *" +
              (v.title || v.desc || "-").slice(0, 40) +
              "*",
            "┃    👤 @" + (v.author?.unique_id || "unknown"),
            "┃",
          ),
        );
      lines.push("┗━━━━━━━━━━━━━━━━━━━━┛");
      ctx.reply(lines.join("\n"));
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
