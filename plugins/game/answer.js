import stringSimilarity from "string-similarity";
import db from "../../lib/database.js";

export default {
  all: async function (msg, ctx) {
    if (!ctx.text || ctx.fromMe || ctx.isCmd) return;

    if (global.gameSessions?.[ctx.chatId]) {
      const s = global.gameSessions[ctx.chatId];
      if (ctx.text.toLowerCase() === ".nyerah") {
        await ctx.reply("😔 Jawaban: *" + s.answer + "*");
        delete global.gameSessions[ctx.chatId];
        return;
      }
      const score = stringSimilarity.compareTwoStrings(
        ctx.text.toLowerCase(),
        s.answer,
      );
      if (score >= 0.8) {
        const u = global.db.users[ctx.senderId];
        if (u) {
          u.limit = (u.limit || 0) + 3;
          db.write("users");
        }
        await ctx.reply(
          "✅ *BENAR!* Jawaban: *" + s.answer + "*\n🎁 +3 limit!",
        );
        delete global.gameSessions[ctx.chatId];
      } else if (score >= 0.5) await ctx.react("🤔");
      return;
    }

    if (global.mathSessions?.[ctx.chatId]) {
      const s = global.mathSessions[ctx.chatId];
      if (ctx.text.trim() === ".lewati") {
        await ctx.reply("➡️ Jawaban: *" + s.answer + "*");
        delete global.mathSessions[ctx.chatId];
        return;
      }
      if (ctx.text.trim() === s.answer) {
        const u = global.db.users[ctx.senderId];
        if (u) {
          u.limit = (u.limit || 0) + 2;
          db.write("users");
        }
        await ctx.reply("✅ *BENAR!* +2 limit");
        delete global.mathSessions[ctx.chatId];
      }
      return;
    }

    if (global.tebakSessions?.[ctx.chatId]) {
      const s = global.tebakSessions[ctx.chatId];
      if (ctx.text.toLowerCase() === ".nyerah") {
        await ctx.reply("😔 Jawaban: *" + s.word + "*");
        delete global.tebakSessions[ctx.chatId];
        return;
      }
      if (ctx.text.toUpperCase() === s.word) {
        const u = global.db.users[ctx.senderId];
        if (u) {
          u.limit = (u.limit || 0) + 3;
          db.write("users");
        }
        await ctx.reply("✅ *BENAR!* Kata: *" + s.word + "* +3 limit!");
        delete global.tebakSessions[ctx.chatId];
      }
    }
  },
};
