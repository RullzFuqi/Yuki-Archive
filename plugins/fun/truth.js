const TRUTHS = [
  "Siapa crush kamu saat ini?",
  "Pernahkah kamu berbohong ke teman dekat?",
  "Apa hal yang paling kamu sesali?",
  "Apa kebiasaan buruk yang disembunyikan?",
  "Hal paling aneh yang pernah dilakukan?",
  "Kapan terakhir kamu menangis dan kenapa?",
];

export default {
  name: "truth",
  category: "Fun",
  description: "Pertanyaan truth random",
  async handle({ ctx }) {
    ctx.reply(
      "🔮 *TRUTH*\n\n" + TRUTHS[Math.floor(Math.random() * TRUTHS.length)],
    );
  },
};
