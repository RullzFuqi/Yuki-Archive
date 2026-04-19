import db from "../../lib/database.js";

export default {
  name: "setwelcome",
  category: "Group",
  description: "Set teks welcome",
  groupOnly: true,
  admin: true,
  async handle({ ctx }) {
    const grp = global.db.groups[ctx.chatId];
    if (!grp) return ctx.reply("❌ Grup tidak terdaftar.");
    if (!ctx.hasArgs)
      return ctx.reply("❌ Masukkan teks.\nPlaceholder: @user @subject @count");
    grp.sWelcome = ctx.argsStr;
    db.write("groups");
    ctx.reply("✅ Teks welcome disimpan.");
  },
};
