import db from "../../lib/database.js";

export default {
  name: "afk",
  category: "General",
  description: "Set status AFK",
  async handle({ ctx }) {
    const user = global.db.users[ctx.senderId];
    if (!user) return ctx.reply("❌ Data tidak ditemukan.");
    user.afk = Date.now();
    user.afkReason = ctx.argsStr || "tidak ada alasan";
    db.write("users");
    ctx.reply("😴 *AFK aktif*\n✏️ " + user.afkReason);
  },
};
