export default {
  name: "readvo",
  category: "Tools",
  description: "Buka pesan view once",
  command: ["readvo", "openvo"],
  async handle({ ctx, sock }) {
    const isQ =
      ctx.isQuoted && ["imageMessage", "videoMessage"].includes(ctx.quotedType);
    if (!isQ) return ctx.reply("❌ Reply pesan view-once gambar/video.");
    try {
      const content = ctx.quoted;
      const type = ctx.quotedType;
      const mc = content[type];
      if (!mc) return ctx.reply("❌ Tidak ada media.");
      mc.viewOnce = false;
      await sock.sendMessage(
        ctx.chatId,
        {
          [type.replace("Message", "")]: { url: mc.url },
          mimetype: mc.mimetype,
          caption: "👁️ View Once dibuka!",
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
