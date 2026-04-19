import axios from "axios";

const sessions = new Map();

export default {
  name: "ai",
  category: "AI",
  description: "Chat dengan AI",
  command: ["ai", "bell", "chat"],
  async handle({ ctx, sock }) {
    const q = ctx.argsStr.trim() || ctx.quotedText?.trim();
    if (!q)
      return ctx.reply("❌ Masukkan pertanyaan.\nContoh: .ai siapa kamu?");
    await ctx.react("⏳");
    try {
      const key = global.bot?.api?.termai || "Bell409";
      const res = await axios.get(
        "https://api.termai.cc/api/chat/bell?query=" +
          encodeURIComponent(q) +
          "&id=" +
          encodeURIComponent(ctx.senderId) +
          "&key=" +
          key,
        { timeout: 15000 },
      );
      const answer =
        res.data?.result || res.data?.message || res.data?.response;
      if (!answer) return ctx.reply("❌ Tidak ada respons dari AI.");
      await ctx.reply("🤖 *AI*\n\n" + answer);
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
