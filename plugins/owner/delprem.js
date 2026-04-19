import db from "../../lib/database.js";

export default {
  name: "delprem",
  category: "Owner",
  description: "Hapus premium user",
  ownerAccess: true,
  async handle({ ctx }) {
    const who = ctx.mentionedJid?.[0] || ctx.quotedSender;
    if (!who) return ctx.reply("❌ Tag atau reply user.");
    const user = global.db.users[who];
    if (!user) return ctx.reply("❌ User tidak ditemukan.");
    user.premium = { on: false, expiredAt: 0 };
    db.write("users");
    ctx.reply("✅ Premium @" + who.split("@")[0] + " dicabut.");
  },
};
