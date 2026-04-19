import axios from "axios";

export default {
  name: "ttstalk",
  category: "Stalker",
  description: "Stalk profil TikTok",
  command: ["ttstalk", "tiktokstalk"],
  async handle({ ctx, sock }) {
    const username = ctx.args[0]?.replace("@", "");
    if (!username) return ctx.reply("❌ .ttstalk <username>");
    await ctx.react("⏳");
    try {
      const { data } = await axios.get(
        "https://api.deltaku.web.id/api/stalk/tiktok?username=" +
          encodeURIComponent(username),
        { timeout: 15000 },
      );
      if (!data.status)
        return ctx.reply("❌ Akun tidak ditemukan: " + username);
      const d = data.data?.user || data.data;
      const stats = data.data?.statistics || {};
      await sock.sendMessage(
        ctx.chatId,
        {
          image: { url: d.avatar || global.bot.media.banner },
          caption: [
            "┏━━━〔 *TIKTOK STALKER* 〕━━━┓",
            "┃ 👤  @" + (d.unique_id || username),
            "┃ 📛  " + (d.nickname || "-"),
            "┃ ✅  Verified: " + (d.verified ? "Ya" : "Tidak"),
            "┃",
            "┃ 📊 Statistics:",
            "┃    Followers: *" + (stats.followers || 0).toLocaleString() + "*",
            "┃    Hearts   : *" + (stats.hearts || 0).toLocaleString() + "*",
            "┃    Videos   : *" + (stats.videos || 0) + "*",
            "┗━━━━━━━━━━━━━━━━━━━━┛",
          ].join("\n"),
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
