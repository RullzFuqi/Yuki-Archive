import axios from "axios";

export default {
  name: "spotifydl",
  category: "Downloader",
  description: "Download lagu Spotify",
  command: ["spotifydl", "spdl"],
  limitRequired: 3,
  async handle({ ctx, sock }) {
    if (!ctx.hasArgs) return ctx.reply("❌ Masukkan judul atau link Spotify.");
    await ctx.react("⏳");
    try {
      const key = global.bot?.api?.termai || "Bell409";
      const isUrl = /^https?:\/\//.test(ctx.argsStr);
      let trackName = ctx.argsStr;
      if (!isUrl) {
        const sr = await axios.get(
          "https://api.termai.cc/api/search/spotify?q=" +
            encodeURIComponent(ctx.argsStr) +
            "&key=" +
            key,
          { timeout: 10000 },
        );
        const t = (sr.data?.result || sr.data?.data || [])[0];
        trackName = t ? (t.name + " " + (t.artists || "")).trim() : ctx.argsStr;
      }
      const ytQ =
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent(trackName);
      const res = await axios.get(
        "https://api.termai.cc/api/dl/ytmp3?url=" +
          encodeURIComponent(ytQ) +
          "&key=" +
          key,
        { timeout: 30000 },
      );
      const data = res.data?.result || res.data;
      if (!data?.download_url) return ctx.reply("❌ Gagal download.");
      const buf = await axios.get(data.download_url, {
        responseType: "arraybuffer",
        timeout: 60000,
      });
      await sock.sendMessage(
        ctx.chatId,
        {
          audio: Buffer.from(buf.data),
          mimetype: "audio/mpeg",
          fileName: trackName.slice(0, 40) + ".mp3",
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
