import axios from "axios";
import { isUrl } from "../../lib/tools.js";

export default {
  name: "ig",
  category: "Downloader",
  description: "Download media Instagram",
  command: ["ig", "igdl", "instagram"],
  limitRequired: 2,
  async handle({ ctx, sock }) {
    const url = ctx.argsStr.trim();
    if (!url || !isUrl(url) || !url.includes("instagram.com"))
      return ctx.reply("❌ Masukkan link Instagram yang valid.");
    await ctx.react("⏳");
    try {
      const key = global.bot?.api?.termai || "Bell409";
      const res = await axios.get(
        "https://api.termai.cc/api/dl/ig?url=" +
          encodeURIComponent(url) +
          "&key=" +
          key,
        { timeout: 20000 },
      );
      const items = Array.isArray(res.data?.result)
        ? res.data.result
        : [res.data?.result];
      if (!items[0]?.url) return ctx.reply("❌ Gagal. Pastikan link publik.");
      for (const item of items.slice(0, 4)) {
        if (!item?.url) continue;
        const buf = await axios.get(item.url, {
          responseType: "arraybuffer",
          timeout: 30000,
        });
        const vid = item.type === "video" || item.url?.includes(".mp4");
        await sock.sendMessage(
          ctx.chatId,
          vid
            ? {
                video: Buffer.from(buf.data),
                mimetype: "video/mp4",
                caption: "📸 IG",
              }
            : { image: Buffer.from(buf.data), caption: "📸 IG" },
          { quoted: ctx._msg },
        );
      }
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
