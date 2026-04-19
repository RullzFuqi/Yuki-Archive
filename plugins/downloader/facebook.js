import axios from "axios";
import { isUrl } from "../../lib/tools.js";

export default {
  name: "fb",
  category: "Downloader",
  description: "Download video Facebook",
  command: ["fb", "fbdl", "facebook"],
  limitRequired: 2,
  async handle({ ctx, sock }) {
    const url = ctx.argsStr.trim();
    if (!url || !isUrl(url))
      return ctx.reply("❌ Masukkan link Facebook yang valid.");
    await ctx.react("⏳");
    try {
      const key = global.bot?.api?.termai || "Bell409";
      const res = await axios.get(
        "https://api.termai.cc/api/dl/fb?url=" +
          encodeURIComponent(url) +
          "&key=" +
          key,
        { timeout: 20000 },
      );
      const data = res.data?.result || res.data;
      const dlUrl = data?.hd || data?.sd || data?.url;
      if (!dlUrl) return ctx.reply("❌ Gagal. Pastikan video publik.");
      const buf = await axios.get(dlUrl, {
        responseType: "arraybuffer",
        timeout: 60000,
      });
      await sock.sendMessage(
        ctx.chatId,
        {
          video: Buffer.from(buf.data),
          caption: "📘 " + (data.title || "Facebook").slice(0, 50),
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
