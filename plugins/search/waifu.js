import axios from "axios";

const TAGS = [
  "waifu",
  "neko",
  "shinobu",
  "megumin",
  "bully",
  "cuddle",
  "cry",
  "hug",
  "kiss",
  "pat",
  "smug",
  "bonk",
  "blush",
  "smile",
  "wave",
  "happy",
  "wink",
  "poke",
  "slap",
  "bite",
];

export default {
  name: "waifu",
  category: "Search",
  description: "Gambar waifu random",
  async handle({ ctx, sock }) {
    const tag = ctx.args[0]?.toLowerCase();
    const valid = TAGS.includes(tag) ? tag : "waifu";
    await ctx.react("⏳");
    try {
      const res = await axios.get("https://api.waifu.pics/sfw/" + valid, {
        timeout: 10000,
      });
      const url = res.data?.url;
      if (!url) return ctx.reply("❌ Gagal ambil gambar.");
      const buf = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 15000,
      });
      await sock.sendMessage(
        ctx.chatId,
        {
          image: Buffer.from(buf.data),
          caption:
            "🎌 Waifu — *" +
            valid +
            "*\n\nTag: " +
            TAGS.slice(0, 8).join(", ") +
            "...",
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
