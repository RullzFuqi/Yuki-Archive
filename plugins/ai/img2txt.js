import axios from "axios";

export default {
  name: "img2txt",
  category: "AI",
  description: "Analisis gambar dengan AI",
  command: ["img2txt", "analyzeimg", "descimg"],
  limitRequired: 2,
  async handle({ ctx, sock }) {
    const isQ = ctx.isQuoted && ctx.quotedType === "imageMessage";
    const is = ctx.isMedia && ctx.mediaType === "image";
    if (!is && !isQ) return ctx.reply("❌ Kirim atau reply gambar.");
    await ctx.react("⏳");
    try {
      const buf = isQ ? await ctx.downloadQuoted() : await ctx.download();
      const b64 = buf.toString("base64");
      const key = global.bot?.api?.termai || "Bell409";
      const prompt =
        ctx.argsStr.trim() ||
        "Deskripsikan gambar ini secara detail dalam bahasa Indonesia.";
      const res = await axios.post(
        "https://api.termai.cc/api/ai/image-analyze?key=" + key,
        { image: b64, prompt },
        { timeout: 20000 },
      );
      const answer =
        res.data?.result || res.data?.message || res.data?.response;
      if (!answer) return ctx.reply("❌ Gagal menganalisis gambar.");
      await ctx.reply("🖼️ *Analisis Gambar*\n\n" + answer);
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
