import db from "../../lib/database.js";

export default {
  name: "ban",
  category: "Owner",
  description: "Ban/unban user",
  ownerAccess: true,
  command: ["ban", "unban"],
  async handle({ ctx }) {
    const who = ctx.mentionedJid?.[0] || ctx.quotedSender;
    if (!who) return ctx.reply("❌ Tag atau reply user.");
    const user = global.db.users[who];
    if (!user) return ctx.reply("❌ User tidak ditemukan.");
    const isBan = ctx.command === "ban";
    user.banned = isBan;
    db.write("users");
    ctx.reply(
      "✅ @" + who.split("@")[0] + " " + (isBan ? "di-ban" : "di-unban") + ".",
    );
  },
};
