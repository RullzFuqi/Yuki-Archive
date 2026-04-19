import db from "../../lib/database.js";

const MAP = {
  welcome: "welcome",
  antilink: "antiLink",
  antidelete: "delete",
  autoai: "autoAi",
};

export default {
  name: "welcome",
  category: "Group",
  description: "Toggle fitur grup on/off",
  command: ["welcome", "antilink", "antidelete", "autoai"],
  groupOnly: true,
  admin: true,
  async handle({ ctx }) {
    const grp = global.db.groups[ctx.chatId];
    if (!grp) return ctx.reply("❌ Grup tidak terdaftar.");
    const key = MAP[ctx.command.toLowerCase()];
    if (!key) return;
    const val = ctx.args[0]?.toLowerCase();
    if (!val || !["on", "off"].includes(val))
      return ctx.reply(
        "*" +
          ctx.command +
          "*: " +
          (grp[key] ? "✅ ON" : "❌ OFF") +
          "\n\nGunakan: ." +
          ctx.command +
          " on/off",
      );
    grp[key] = val === "on";
    db.write("groups");
    ctx.reply(
      (grp[key] ? "✅" : "❌") +
        " *" +
        ctx.command +
        "* " +
        (grp[key] ? "ON" : "OFF"),
    );
  },
};
