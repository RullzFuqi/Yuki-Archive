import axios from "axios";

export default {
  name: "igstalk",
  category: "Stalker",
  description: "Stalk profil Instagram",
  command: ["igstalk", "instagramstalk"],
  async handle({ ctx, sock }) {
    const username = ctx.args[0]?.replace("@", "");
    if (!username) return ctx.reply("❌ .igstalk <username>");
    await ctx.react("⏳");
    try {
      const res = await axios.get(
        "https://api.deltaku.web.id/api/stalk/instagram?username=" +
          encodeURIComponent(username),
        { timeout: 15000 },
      );
      const d = res.data?.data || res.data;
      if (!d || !d.username) return ctx.reply("❌ Akun tidak ditemukan.");
      await sock.sendMessage(
        ctx.chatId,
        {
          image: { url: d.profile_pic_url || global.bot.media.banner },
          caption: [
            "┏━━━〔 *IG STALKER* 〕━━━┓",
            "┃ 👤  @" + d.username,
            "┃ 📛  " + (d.full_name || "-"),
            "┃ ✅  Verified : " + (d.is_verified ? "Ya" : "Tidak"),
            "┃ 🔒  Private  : " + (d.is_private ? "Ya" : "Tidak"),
            "┃ 👥  Followers: *" +
              (d.follower_count || 0).toLocaleString() +
              "*",
            "┃ 👣  Following: *" +
              (d.following_count || 0).toLocaleString() +
              "*",
            "┃ 🖼️  Posts    : *" + (d.media_count || 0) + "*",
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
