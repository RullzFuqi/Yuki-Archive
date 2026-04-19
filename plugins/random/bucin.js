const QUOTES = [
  "Jarak bukan halangan, asal hati tetap saling mengingat.",
  "Aku tidak butuh banyak hal, cukup kamu yang selalu ada.",
  "Mencintaimu adalah pilihan terbaik yang pernah kubuat.",
  "Kamu adalah alasan mengapa aku percaya pada keajaiban.",
  "Ketika aku bersamamu, dunia terasa lebih indah dari biasanya.",
];

export default {
  name: "bucin",
  category: "Random",
  description: "Quotes bucin random",
  command: ["bucin", "lovequote"],
  async handle({ ctx }) {
    ctx.reply(
      '┏━━━〔 *QUOTES BUCIN* 〕━━━┓\n┃\n┃ 💕 "' +
        QUOTES[Math.floor(Math.random() * QUOTES.length)] +
        '"\n┗━━━━━━━━━━━━━━━━━━━━┛',
    );
  },
};
