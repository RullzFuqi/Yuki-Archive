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
  name: "randomwaifu",
  category: "Random",
  description: "Gambar waifu random",
  command: ["randomwaifu", "rwaifu"],
  async handle({ ctx, sock }) {
    const tag = ctx.args[0]?.toLowerCase();
    const valid = TAGS.includes(tag)
      ? tag
      : TAGS[Math.floor(Math.random() * TAGS.length)];
    await ctx.react("⏳");
    try {
      const res = await axios.get("https://api.waifu.pics/sfw/" + valid, {
        timeout: 10000,
      });
      const url = res.data?.url;
      if (!url) return ctx.reply("❌ Gagal.");
      const buf = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 15000,
      });
      await sock.sendMessage(
        ctx.chatId,
        { image: Buffer.from(buf.data), caption: "🎌 *" + valid + "*" },
        { quoted: ctx._msg },
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
