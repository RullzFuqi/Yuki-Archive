import { rand } from "../../lib/tools.js";

if (!global.mathSessions) global.mathSessions = {};

export default {
  name: "math",
  category: "Game",
  description: "Game tebak matematika",
  command: ["math", "gamemath"],
  async handle({ ctx, sock }) {
    if (global.mathSessions?.[ctx.chatId])
      return ctx.reply("❌ Ada soal aktif. Jawab atau *.lewati*");
    const ops = ["+", "-", "*"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const a = rand(1, 50),
      b = rand(1, 50);
    const answer = String(
      Math.round(Function('"use strict"; return (' + a + op + b + ")")()),
    );
    global.mathSessions[ctx.chatId] = { answer, time: Date.now() };
    setTimeout(() => {
      const s = global.mathSessions?.[ctx.chatId];
      if (s) {
        sock
          .sendMessage(ctx.chatId, {
            text: "⏰ Waktu habis! Jawaban: *" + s.answer + "*",
          })
          .catch(() => {});
        delete global.mathSessions[ctx.chatId];
      }
    }, 30000);
    ctx.reply(
      "🔢 *MATH*\n\n*" +
        a +
        " " +
        op +
        " " +
        b +
        "* = ?\n\n⏱️ 30 detik | .lewati",
    );
  },
};
