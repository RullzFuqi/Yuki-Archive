export default {
  name: "settings",
  category: "Group",
  description: "Lihat pengaturan grup",
  command: ["settings", "groupset"],
  groupOnly: true,
  async handle({ ctx }) {
    const grp = global.db.groups[ctx.chatId];
    if (!grp) return ctx.reply("❌ Grup tidak terdaftar.");
    const c = (v) => (v ? "✅" : "❌");
    ctx.adReply(
      global.bot.media.banner,
      [
        "╭─〔 *SETTINGS GRUP* 〕",
        "│  " + c(grp.welcome) + "  Welcome/Bye",
        "│  " + c(grp.antiLink) + "  Anti Link",
        "│  " + c(grp.delete) + "  Anti Delete",
        "│  " + c(grp.autoAi) + "  Auto AI",
        "╰─ .welcome | .antilink | .antidelete | .autoai on/off",
      ].join("\n"),
    );
  },
};
