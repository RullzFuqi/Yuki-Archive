import db from "../../lib/database.js";

export default {
  name: "kick",
  category: "Group",
  description: "Kick member dari grup",
  groupOnly: true,
  admin: true,
  botAdmin: true,
  async handle({ ctx, sock }) {
    const who = ctx.mentionedJid?.[0] || ctx.quotedSender;
    if (!who) return ctx.reply("❌ Tag atau reply member.");
    await sock.groupParticipantsUpdate(ctx.chatId, [who], "remove");
    ctx.reply("✅ @" + who.split("@")[0] + " di-kick.");
  },
};
