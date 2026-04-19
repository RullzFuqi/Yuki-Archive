import db from "../../lib/database.js";

export default {
  name: "banchat",
  category: "Owner",
  description: "Ban/unban grup dari pakai bot",
  ownerAccess: true,
  command: ["banchat", "unbanchat"],
  groupOnly: true,
  async handle({ ctx }) {
    const grp = global.db.groups[ctx.chatId];
    if (!grp) return ctx.reply("❌ Grup tidak terdaftar.");
    grp.isBanned = ctx.command === "banchat";
    db.write("groups");
    ctx.reply("✅ Grup " + (grp.isBanned ? "di-ban" : "di-unban") + ".");
  },
};
