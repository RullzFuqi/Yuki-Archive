import axios from "axios";
import { isUrl } from "../../lib/tools.js";

export default {
  name: "ss",
  category: "Tools",
  description: "Screenshot website",
  command: ["ss", "ssweb", "screenshot"],
  limitRequired: 1,
  async handle({ ctx, sock }) {
    if (!ctx.hasArgs || !isUrl(ctx.argsStr)) return ctx.reply("❌ .ss <url>");
    await ctx.react("⏳");
    try {
      const res = await axios.get(
        "https://api.screenshotmachine.com?key=demo&url=" +
          encodeURIComponent(ctx.argsStr) +
          "&dimension=1366x768",
        { responseType: "arraybuffer", timeout: 20000 },
      );
      await sock.sendMessage(
        ctx.chatId,
        { image: Buffer.from(res.data), caption: "🌐 " + ctx.argsStr },
        { quoted: ctx._msg },
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
