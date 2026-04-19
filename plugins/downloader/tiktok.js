import axios from "axios";
import { isUrl } from "../../lib/tools.js";

export default {
  name: "tiktok",
  category: "Downloader",
  description: "Download video TikTok",
  command: ["tiktok", "tt", "ttdl"],
  limitRequired: 2,
  async handle({ ctx, sock }) {
    const url = ctx.argsStr.trim();
    if (!url || !isUrl(url)) return ctx.reply("❌ Masukkan link TikTok.");
    await ctx.react("⏳");
    try {
      const res = await axios.get(
        "https://api.tiklydown.eu.org/api/download?url=" +
          encodeURIComponent(url),
        { timeout: 15000 },
      );
      const data = res.data;
      if (!data?.video?.noWatermark)
        return ctx.reply("❌ Gagal. Coba link lain.");
      const buf = await axios.get(data.video.noWatermark, {
        responseType: "arraybuffer",
        timeout: 30000,
      });
      const cap =
        "┏━━━〔 *TIKTOK DL* 〕━━━┓\n┃ 🎵  " +
        (data.title || "TikTok").slice(0, 50) +
        "\n┃ 👤  " +
        (data.author?.nickname || "Unknown") +
        "\n┗━━━━━━━━━━━━━━━━━━━━┛";
      await sock.sendMessage(
        ctx.chatId,
        { video: Buffer.from(buf.data), caption: cap, mimetype: "video/mp4" },
        { quoted: ctx._msg },
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
