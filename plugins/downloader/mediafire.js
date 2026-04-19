import axios from "axios";
import { isUrl } from "../../lib/tools.js";

export default {
  name: "mediafire",
  category: "Downloader",
  description: "Ambil link download MediaFire",
  command: ["mediafire", "mfdl"],
  limitRequired: 1,
  async handle({ ctx }) {
    const url = ctx.argsStr.trim();
    if (!url || !isUrl(url) || !url.includes("mediafire.com"))
      return ctx.reply("❌ Masukkan link MediaFire yang valid.");
    await ctx.react("⏳");
    try {
      const key = global.bot?.api?.termai || "Bell409";
      const res = await axios.get(
        "https://api.termai.cc/api/dl/mediafire?url=" +
          encodeURIComponent(url) +
          "&key=" +
          key,
        { timeout: 20000 },
      );
      const data = res.data?.result || res.data;
      if (!data?.download_url) return ctx.reply("❌ Gagal ambil link.");
      ctx.reply(
        "┏━━━〔 *MEDIAFIRE DL* 〕━━━┓\n┃ 📦  *" +
          (data.filename || "File") +
          "*\n┃ 📁  " +
          (data.size || "N/A") +
          "\n┃ 🔗  " +
          data.download_url +
          "\n┗━━━━━━━━━━━━━━━━━━━━┛",
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
