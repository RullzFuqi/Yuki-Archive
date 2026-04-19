import os from "os";
import { runtime } from "../../lib/tools.js";

export default {
  name: "ping",
  category: "General",
  description: "Cek latency bot",
  command: ["ping", "p"],
  async handle({ ctx }) {
    const ms = Date.now() - ctx.timestamp;
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    ctx.adReply(
      global.bot.media.banner,
      [
        "*PING*",
        "🏓 Latency : " + ms + " ms",
        "💾 RAM     : " + ram + " MB",
        "⏱️ Uptime  : " + runtime(process.uptime()),
        "💻 Node    : " + process.version,
      ].join("\n"),
    );
  },
};
