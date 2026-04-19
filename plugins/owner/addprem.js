import db from "../../lib/database.js";

export default {
  name: "addprem",
  category: "Owner",
  description: "Tambah premium ke user",
  ownerAccess: true,
  command: ["addprem", "setprem"],
  async handle({ ctx }) {
    const who = ctx.mentionedJid?.[0] || ctx.quotedSender;
    if (!who) return ctx.reply("❌ Tag atau reply user.");
    const hours = parseInt(ctx.args[1] || ctx.args[0]) || 720;
    const user = global.db.users[who];
    if (!user) return ctx.reply("❌ User belum terdaftar.");
    user.premium = { on: true, expiredAt: Date.now() + hours * 3600000 };
    db.write("users");
    ctx.reply("✅ @" + who.split("@")[0] + " Premium " + hours + " jam.");
  },
};
