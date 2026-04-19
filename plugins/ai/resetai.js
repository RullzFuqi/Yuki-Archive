import axios from "axios";

export default {
  name: "resetai",
  category: "AI",
  description: "Reset sesi percakapan AI",
  command: ["resetai", "clearcache"],
  async handle({ ctx }) {
    try {
      const key = global.bot?.api?.termai || "Bell409";
      await axios.get(
        "https://api.termai.cc/api/chat/bell/reset?id=" +
          encodeURIComponent(ctx.senderId) +
          "&key=" +
          key,
        { timeout: 10000 },
      );
      ctx.reply("✅ Sesi AI direset.");
    } catch {
      ctx.reply("✅ Sesi AI direset.");
    }
  },
};
