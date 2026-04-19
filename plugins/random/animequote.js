const QUOTES = [
  [
    "Jika kau tidak menyerah, kau masih punya kesempatan.",
    "Vegeta - Dragon Ball Z",
  ],
  ["Aku akan menjadi Hokage!", "Naruto Uzumaki - Naruto"],
  ["Tidak ada rasa sakit yang sia-sia.", "Zenitsu - Demon Slayer"],
  ["Jadilah orang yang layak mendapat kekuatan itu.", "All Might - MHA"],
  [
    "Orang yang tidak bisa membuang sesuatu tidak bisa mengubah apapun.",
    "Armin - AoT",
  ],
];

export default {
  name: "animequote",
  category: "Random",
  description: "Quote anime random",
  command: ["animequote", "qanime"],
  async handle({ ctx }) {
    const [quote, char] = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    ctx.reply(
      '┏━━━〔 *ANIME QUOTE* 〕━━━┓\n┃\n┃ "' +
        quote +
        '"\n┃\n┃ — _' +
        char +
        "_\n┗━━━━━━━━━━━━━━━━━━━━┛",
    );
  },
};
