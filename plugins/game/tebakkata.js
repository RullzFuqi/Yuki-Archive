const WORDS = [
  "RUMAH",
  "MAKAN",
  "TIDUR",
  "BELAJAR",
  "BERLARI",
  "MENULIS",
  "MEMBACA",
  "BERMAIN",
  "BEKERJA",
  "SEKOLAH",
  "KUCING",
  "ANJING",
  "BURUNG",
  "IKAN",
  "BUNGA",
  "POHON",
  "LANGIT",
  "LAUTAN",
  "GUNUNG",
  "PADANG",
  "INDONESIA",
  "JAKARTA",
  "SURABAYA",
  "BANDUNG",
  "YOGYAKARTA",
];

if (!global.tebakSessions) global.tebakSessions = {};

export default {
  name: "tebakkata",
  category: "Game",
  description: "Game tebak kata",
  async handle({ ctx, sock }) {
    if (global.tebakSessions?.[ctx.chatId])
      return ctx.reply("❌ Ada game aktif! Jawab atau *.nyerah*");
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const hint = word
      .split("")
      .map((c, i) => (i === 0 || i === word.length - 1 ? c : "_"))
      .join(" ");
    global.tebakSessions[ctx.chatId] = {
      word,
      starter: ctx.senderId,
      time: Date.now(),
    };
    setTimeout(() => {
      const s = global.tebakSessions?.[ctx.chatId];
      if (s) {
        sock
          .sendMessage(ctx.chatId, {
            text: "⏰ Waktu habis!\nJawaban: *" + s.word + "*",
          })
          .catch(() => {});
        delete global.tebakSessions[ctx.chatId];
      }
    }, 60000);
    ctx.reply(
      "┏━━━〔 *TEBAK KATA* 〕━━━┓\n┃\n┃ 🔤 " +
        hint +
        "\n┃ 📏 Panjang: " +
        word.length +
        " huruf\n┃\n┃ ⏱️ 60 detik | .nyerah\n┗━━━━━━━━━━━━━━━━━━━━┛",
    );
  },
};
