import axios from "axios";

export default {
  name: "tts",
  category: "Tools",
  description: "Text to speech",
  command: ["tts", "texttospeech"],
  limitRequired: 1,
  async handle({ ctx, sock }) {
    const a = ctx.argsStr.trim().split(" ");
    const lang = a[0] || "id";
    const text = ctx.isQuoted ? ctx.quotedText : a.slice(1).join(" ");
    if (!text) return ctx.reply("❌ .tts <lang> <teks>");
    await ctx.react("⏳");
    try {
      const res = await axios.get(
        "https://translate.google.com/translate_tts?ie=UTF-8&q=" +
          encodeURIComponent(text) +
          "&tl=" +
          lang +
          "&client=tw-ob",
        {
          responseType: "arraybuffer",
          headers: { "User-Agent": "Mozilla/5.0" },
        },
      );
      await sock.sendMessage(
        ctx.chatId,
        { audio: Buffer.from(res.data), mimetype: "audio/mpeg", ptt: true },
        { quoted: ctx._msg },
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
