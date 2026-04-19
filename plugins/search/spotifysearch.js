import axios from "axios";

export default {
  name: "spotifysearch",
  category: "Search",
  description: "Cari lagu di Spotify",
  command: ["spotifysearch", "sps"],
  async handle({ ctx }) {
    if (!ctx.hasArgs) return ctx.reply("❌ .spotifysearch <kata kunci>");
    await ctx.react("⏳");
    try {
      const key = global.bot?.api?.termai || "Bell409";
      const res = await axios.get(
        "https://api.termai.cc/api/search/spotify?q=" +
          encodeURIComponent(ctx.argsStr) +
          "&key=" +
          key,
        { timeout: 10000 },
      );
      const list = res.data?.result || res.data?.data || [];
      if (!list.length) return ctx.reply("❌ Tidak ditemukan.");
      const lines = ["┏━━━〔 *SPOTIFY SEARCH* 〕━━━┓", "┃"];
      list
        .slice(0, 5)
        .forEach((t, i) =>
          lines.push(
            "┃ " + (i + 1) + ". *" + (t.name || "-").slice(0, 40) + "*",
            "┃    👤 " + (t.artists || t.artist || "-"),
            "┃",
          ),
        );
      lines.push("┗━━━ .spotifydl <judul> untuk download ━━━┛");
      ctx.reply(lines.join("\n"));
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
