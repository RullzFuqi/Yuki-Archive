const DARES = [
  "Kirim foto selfie sekarang!",
  "Ceritakan rahasia kecilmu ke chat.",
  "Nyanyikan 1 bait lagu dan kirim voice note.",
  "Ganti nama kontakmu jadi nama hewan selama 1 jam.",
  "Kirim pesan ke orang yang kamu suka.",
  "Kirim emoji paling aneh ke 3 orang berbeda.",
];

export default {
  name: "dare",
  category: "Fun",
  description: "Tantangan dare random",
  async handle({ ctx }) {
    ctx.reply(
      "🎯 *DARE*\n\n" + DARES[Math.floor(Math.random() * DARES.length)],
    );
  },
};
