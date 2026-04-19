export default {
  name: "promote",
  category: "Group",
  description: "Promote member jadi admin",
  groupOnly: true,
  admin: true,
  botAdmin: true,
  command: ["promote", "jadiadmin"],
  async handle({ ctx, sock }) {
    const who = ctx.mentionedJid?.[0] || ctx.quotedSender;
    if (!who) return ctx.reply("❌ Tag atau reply member.");
    await sock.groupParticipantsUpdate(ctx.chatId, [who], "promote");
    ctx.reply("✅ @" + who.split("@")[0] + " jadi *Admin*.");
  },
};
