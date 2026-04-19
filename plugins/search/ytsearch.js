import yts from "yt-search";

export default {
  name: "ytsearch",
  category: "Search",
  description: "Cari video di YouTube",
  command: ["ytsearch", "yts"],
  async handle({ ctx }) {
    if (!ctx.hasArgs) return ctx.reply("❌ .ytsearch <kata kunci>");
    await ctx.react("⏳");
    try {
      const data = await yts(ctx.argsStr);
      const res = data.videos?.[0];
      if (!res) return ctx.reply('❌ Tidak ditemukan: "' + ctx.argsStr + '"');
      ctx.adReply(
        res.thumbnail,
        [
          "┏━━━〔 *YOUTUBE SEARCH* 〕━━━┓",
          "┃ 🎬  " + res.title,
          "┃ 👤  " + (res.author?.name || "-"),
          "┃ ⏱️  " + (res.timestamp || "-"),
          "┃ 👁️  " + (res.views?.toLocaleString() || 0) + " views",
          "┃",
          "┃ 🔗  " + res.url,
          "┗━━━━━━━━━━━━━━━━━━━━┛",
          "",
          "_Gunakan .ytmp3 atau .ytmp4 untuk download_",
        ].join("\n"),
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
