import axios from "axios";

if (!global.gameSessions) global.gameSessions = {};

export default {
  name: "caklontong",
  category: "Game",
  description: "Game tebak teka-teki cak lontong",
  async handle({ ctx, sock }) {
    if (global.gameSessions?.[ctx.chatId])
      return ctx.reply("❌ Ada game aktif!\nJawab atau ketik *.nyerah*");
    await ctx.react("⏳");
    try {
      const res = await axios.get("https://api.termai.cc/api/game/caklontong", {
        timeout: 10000,
      });
      const data = res.data?.result || res.data;
      if (!data?.question) throw new Error("No data");
      global.gameSessions[ctx.chatId] = {
        type: "caklontong",
        question: data.question,
        answer: String(data.answer || data.jawaban)
          .toLowerCase()
          .trim(),
        starter: ctx.senderId,
        time: Date.now(),
      };
      setTimeout(() => {
        const s = global.gameSessions?.[ctx.chatId];
        if (s) {
          sock
            .sendMessage(ctx.chatId, {
              text: "⏰ Waktu habis!\nJawaban: *" + s.answer + "*",
            })
            .catch(() => {});
          delete global.gameSessions[ctx.chatId];
        }
      }, 60000);
      ctx.reply(
        "┏━━━〔 *CAK LONTONG* 〕━━━┓\n┃\n┃ ❓ " +
          data.question +
          "\n┃\n┃ ⏱️ 60 detik | .nyerah\n┗━━━━━━━━━━━━━━━━━━━━┛",
      );
    } catch (e) {
      ctx.reply("❌ Gagal load soal: " + e.message);
    }
  },
};
