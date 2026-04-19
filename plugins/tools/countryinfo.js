import axios from "axios";

export default {
  name: "country",
  category: "Tools",
  description: "Info negara",
  command: ["country", "negara", "countryinfo"],
  async handle({ ctx }) {
    if (!ctx.hasArgs) return ctx.reply("❌ .country <negara>");
    await ctx.react("⏳");
    try {
      const res = await axios.get(
        "https://restcountries.com/v3.1/name/" +
          encodeURIComponent(ctx.argsStr),
        { timeout: 10000 },
      );
      const c = res.data[0];
      ctx.reply(
        [
          "┏━━━〔 *" + c.name.common.toUpperCase() + "* 〕━━━┓",
          "┃ 🌍  Wilayah  : *" + c.region + "*",
          "┃ 🏙️  Ibukota  : *" + (c.capital?.[0] || "N/A") + "*",
          "┃ 👥  Populasi : *" + (c.population || 0).toLocaleString() + "*",
          "┃ 💬  Bahasa   : *" +
            Object.values(c.languages || {}).join(", ") +
            "*",
          "┃ 💰  Mata Uang: *" +
            Object.values(c.currencies || {})
              .map((x) => x.name)
              .join(", ") +
            "*",
          "┗━━━━━━━━━━━━━━━━━━━━┛",
        ].join("\n"),
      );
      ctx.react("✅");
    } catch {
      ctx.react("❌");
      ctx.reply("❌ Negara tidak ditemukan: " + ctx.argsStr);
    }
  },
};
