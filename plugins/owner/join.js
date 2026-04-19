export default {
  name: "join",
  category: "Owner",
  description: "Join grup via link",
  ownerAccess: true,
  async handle({ ctx, sock }) {
    const link = ctx.argsStr.trim();
    if (!link) return ctx.reply("❌ Masukkan link grup.");
    const code = link.split("chat.whatsapp.com/").pop()?.split("?")[0];
    if (!code) return ctx.reply("❌ Link tidak valid.");
    await sock.groupAcceptInvite(code);
    ctx.reply("✅ Berhasil join grup!");
  },
};
