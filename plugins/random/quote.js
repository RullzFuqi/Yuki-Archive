import axios from "axios";

const LOCAL = [
  "Jangan pernah menyerah, karena hari ini yang terasa berat adalah pondasi kesuksesan esok hari.",
  "Kegagalan adalah kesempatan untuk memulai lagi dengan lebih cerdas.",
  "Impian tidak bekerja kecuali kamu yang mengerjakannya.",
];

export default {
  name: "quote",
  category: "Random",
  description: "Quote random",
  command: ["quote", "katabijak", "motivasi"],
  async handle({ ctx }) {
    try {
      const res = await axios.get("https://zenquotes.io/api/random", {
        timeout: 5000,
      });
      const q = res.data?.[0];
      if (q)
        return ctx.reply(
          '┏━━━〔 *RANDOM QUOTE* 〕━━━┓\n┃\n┃ "' +
            q.q +
            '"\n┃\n┃ — _' +
            q.a +
            "_\n┗━━━━━━━━━━━━━━━━━━━━┛",
        );
    } catch {}
    ctx.reply(
      '┏━━━〔 *QUOTE* 〕━━━┓\n┃\n┃ "' +
        LOCAL[Math.floor(Math.random() * LOCAL.length)] +
        '"\n┗━━━━━━━━━━━━━━━━━━━━┛',
    );
  },
};
