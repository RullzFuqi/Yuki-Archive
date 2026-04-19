import db from "../../lib/database.js";

export default {
  name: "setbye",
  category: "Group",
  description: "Set teks bye",
  groupOnly: true,
  admin: true,
  async handle({ ctx }) {
    const grp = global.db.groups[ctx.chatId];
    if (!grp) return ctx.reply("❌ Grup tidak terdaftar.");
    if (!ctx.hasArgs) return ctx.reply("❌ Masukkan teks.");
    grp.sBye = ctx.argsStr;
    db.write("groups");
    ctx.reply("✅ Teks bye disimpan.");
  },
};
