import { rand } from "../../lib/tools.js";

const UNITS = ["detik", "menit", "jam", "hari", "minggu", "bulan", "tahun"];

export default {
  name: "kapan",
  category: "Fun",
  description: "Kapan sesuatu terjadi?",
  command: ["kapan", "kapankah"],
  async handle({ ctx }) {
    if (!ctx.hasArgs) return ctx.reply("❌ .kapan <pertanyaan>");
    ctx.reply(
      "┏━━━〔 *KAPANKAH?* 〕━━━┓\n┃\n┃ ⏳ " +
        ctx.argsStr +
        "\n┃\n┃ Jawabannya: *" +
        rand(1, 999) +
        " " +
        UNITS[Math.floor(Math.random() * UNITS.length)] +
        " lagi* 😄\n┗━━━━━━━━━━━━━━━━━━━━┛",
    );
  },
};
