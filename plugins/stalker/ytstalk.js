import axios from "axios";

export default {
  name: "ytstalk",
  category: "Stalker",
  description: "Stalk channel YouTube",
  command: ["ytstalk", "youtubestalk"],
  async handle({ ctx, sock }) {
    const username = ctx.args[0]?.replace("@", "");
    if (!username) return ctx.reply("❌ .ytstalk <username>");
    await ctx.react("⏳");
    try {
      const { data } = await axios.get(
        "https://api.deltaku.web.id/api/stalk/youtube?username=" +
          encodeURIComponent(username),
        { timeout: 15000 },
      );
      if (!data.status)
        return ctx.reply("❌ Channel tidak ditemukan: " + username);
      const d = data.data;
      const latest =
        d.latest_videos
          ?.slice(0, 3)
          .map((v) => "┃    • " + v.title.slice(0, 40))
          .join("\n") || "┃    tidak ada";
      await sock.sendMessage(
        ctx.chatId,
        {
          image: { url: d.channel.avatarUrl || global.bot.media.banner },
          caption: [
            "┏━━━〔 *YOUTUBE STALKER* 〕━━━┓",
            "┃ 📺  " + (d.channel.title || "Unknown"),
            "┃ 🆔  @" + d.channel.username,
            "┃ 👥  Subscribers: *" + (d.channel.subscriberCount || "0") + "*",
            "┃ 🎬  Videos    : *" + (d.channel.videoCount || "0") + "*",
            "┃",
            "┃ 📹 Latest Videos:",
            latest,
            "┃",
            "┃ 🔗  " + d.channel.channelUrl,
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
