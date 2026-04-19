import db from "../../lib/database.js";

export default {
  name: "autoai",
  category: "AI",
  description: "Toggle auto AI reply saat user reply bot (group only)",
  command: ["autoai", "setautoai"],
  groupOnly: true,
  admin: true,
  async handle({ ctx }) {
    const grp = global.db.groups[ctx.chatId];
    if (!grp) return ctx.reply("❌ Grup tidak terdaftar.");
    const val = ctx.args[0]?.toLowerCase();
    if (!val || !["on", "off"].includes(val))
      return ctx.reply(
        "*autoai*: " +
          (grp.autoAi ? "✅ ON" : "❌ OFF") +
          "\n\nGunakan: .autoai on/off",
      );
    grp.autoAi = val === "on";
    db.write("groups");
    ctx.reply(
      (grp.autoAi ? "✅" : "❌") +
        " *Auto AI* " +
        (grp.autoAi ? "ON" : "OFF") +
        "\n\nBot akan otomatis reply dengan AI saat user me-reply pesan bot di grup ini.",
    );
  },
};
