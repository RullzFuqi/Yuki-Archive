export default {
  name: "groupinfo",
  category: "Group",
  description: "Info lengkap grup",
  groupOnly: true,
  command: ["groupinfo", "gcinfo", "infogroup"],
  async handle({ ctx, sock }) {
    const meta = await sock.groupMetadata(ctx.chatId);
    const admins =
      meta.participants
        .filter((p) => p.admin)
        .map((p) => "@" + p.id.split("@")[0])
        .join(", ") || "tidak ada";
    ctx.adReply(
      global.bot.media.banner,
      [
        "┏━━━〔 *INFO GRUP* 〕━━━┓",
        "┃ 📛  Nama    : *" + meta.subject + "*",
        "┃ 👥  Member  : *" + meta.participants.length + "*",
        "┃ 👑  Dibuat  : *" +
          new Date(meta.creation * 1000).toLocaleDateString("id-ID") +
          "*",
        "┃ 🛡️  Admin   : " + admins,
        "┃ 📝  Desc    : " + (meta.desc || "tidak ada"),
        "┗━━━━━━━━━━━━━━━━━━━━┛",
      ].join("\n"),
    );
  },
};
