import axios from "axios";

export default {
  name: "pinterest",
  category: "Search",
  description: "Cari gambar di Pinterest",
  command: ["pinterest", "pin"],
  limitRequired: 1,
  async handle({ ctx, sock }) {
    if (!ctx.hasArgs) return ctx.reply("❌ .pinterest <kata kunci>");
    await ctx.react("⏳");
    try {
      const key = global.bot?.api?.termai || "Bell409";
      const res = await axios.get(
        "https://api.termai.cc/api/search/pinterest?q=" +
          encodeURIComponent(ctx.argsStr) +
          "&key=" +
          key,
        { timeout: 10000 },
      );
      const results = res.data?.result || res.data?.data || [];
      if (!results.length) return ctx.reply("❌ Tidak ditemukan.");
      const url =
        results[Math.floor(Math.random() * Math.min(5, results.length))];
      const buf = await axios.get(
        typeof url === "string" ? url : url.url || url.image,
        { responseType: "arraybuffer", timeout: 15000 },
      );
      await sock.sendMessage(
        ctx.chatId,
        {
          image: Buffer.from(buf.data),
          caption: "📌 Pinterest: " + ctx.argsStr,
        },
        { quoted: ctx._msg },
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
