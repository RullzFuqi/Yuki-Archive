import { progressBar } from "../../lib/tools.js";

export default {
  name: "profil",
  category: "General",
  description: "Lihat profil kamu",
  command: ["profil", "profile", "me"],
  async handle({ ctx, isPremium }) {
    const u = global.db.users[ctx.senderId] || {};
    const st = ctx.fromMe ? "👑 Owner" : isPremium ? "💎 Premium" : "📊 Free";
    const expN = 100 + (u.level || 1) * 50;
    ctx.adReply(
      global.bot.media.banner,
      [
        "*" + ctx.pushName + "*",
        "📱 +" + ctx.senderId.split("@")[0],
        "🏅 " + st,
        "📊 Limit  : " + (u.limit ?? global.bot.limit.default),
        "✨ EXP    : " +
          (u.exp ?? 0) +
          "/" +
          expN +
          " [" +
          progressBar(u.exp ?? 0, expN) +
          "]",
        "🏆 Level  : " + (u.level ?? 1),
      ].join("\n"),
    );
  },
};
