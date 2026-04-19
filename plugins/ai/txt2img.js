import axios from "axios";

export default {
  name: "txt2img",
  category: "AI",
  description: "Generate gambar dari teks (AI)",
  command: ["txt2img", "generateimg", "aiimg"],
  limitRequired: 3,
  async handle({ ctx, sock }) {
    const q = ctx.argsStr.trim();
    if (!q)
      return ctx.reply(
        "❌ Masukkan deskripsi gambar.\nContoh: .txt2img a cute anime girl",
      );
    await ctx.react("⏳");
    try {
      const key = global.bot?.api?.termai || "Bell409";
      const res = await axios.get(
        "https://api.termai.cc/api/ai/image-generate?prompt=" +
          encodeURIComponent(q) +
          "&key=" +
          key,
        { timeout: 30000 },
      );
      const url = res.data?.result || res.data?.url || res.data?.image;
      if (!url) return ctx.reply("❌ Gagal generate gambar.");
      const buf = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 20000,
      });
      await sock.sendMessage(
        ctx.chatId,
        { image: Buffer.from(buf.data), caption: "🎨 " + q },
        { quoted: ctx._msg },
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
