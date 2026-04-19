import axios from "axios";

export default {
  name: "wallpaper",
  category: "Search",
  description: "Cari wallpaper",
  command: ["wallpaper", "wp"],
  limitRequired: 1,
  async handle({ ctx, sock }) {
    const q = ctx.argsStr.trim() || "anime landscape";
    await ctx.react("⏳");
    try {
      const res = await axios.get(
        "https://source.unsplash.com/1280x720/?" + encodeURIComponent(q),
        { responseType: "arraybuffer", maxRedirects: 5, timeout: 20000 },
      );
      await sock.sendMessage(
        ctx.chatId,
        { image: Buffer.from(res.data), caption: "🖼️ Wallpaper: *" + q + "*" },
        { quoted: ctx._msg },
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
