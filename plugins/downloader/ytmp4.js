import axios from "axios";
import { isUrl } from "../../lib/tools.js";

export default {
  name: "ytmp4",
  category: "Downloader",
  description: "Download video YouTube",
  command: ["ytmp4", "ytv"],
  limitRequired: 3,
  async handle({ ctx, sock }) {
    if (!ctx.hasArgs) return ctx.reply("❌ Masukkan judul atau link YouTube.");
    await ctx.react("⏳");
    try {
      const apiUrl = isUrl(ctx.argsStr)
        ? ctx.argsStr
        : "https://www.youtube.com/results?search_query=" +
          encodeURIComponent(ctx.argsStr);
      const key = global.bot?.api?.termai || "Bell409";
      const res = await axios.get(
        "https://api.termai.cc/api/dl/ytmp4?url=" +
          encodeURIComponent(apiUrl) +
          "&key=" +
          key,
        { timeout: 30000 },
      );
      const data = res.data?.result || res.data;
      if (!data?.download_url) return ctx.reply("❌ Gagal download.");
      const buf = await axios.get(data.download_url, {
        responseType: "arraybuffer",
        timeout: 60000,
      });
      await sock.sendMessage(
        ctx.chatId,
        {
          video: Buffer.from(buf.data),
          caption: "🎬 " + (data.title || "YouTube"),
          mimetype: "video/mp4",
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
