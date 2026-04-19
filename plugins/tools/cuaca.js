import axios from "axios";

export default {
  name: "cuaca",
  category: "Tools",
  description: "Cek cuaca kota",
  command: ["cuaca", "weather"],
  async handle({ ctx }) {
    const kota = ctx.argsStr.trim() || "Jakarta";
    await ctx.react("⏳");
    try {
      const res = await axios.get(
        "https://wttr.in/" + encodeURIComponent(kota) + "?format=j1",
        { timeout: 10000 },
      );
      const ww = res.data?.current_condition?.[0];
      const area = res.data?.nearest_area?.[0];
      if (!ww) return ctx.reply("❌ Kota tidak ditemukan.");
      const city =
        (area?.areaName?.[0]?.value || kota) +
        ", " +
        (area?.country?.[0]?.value || "");
      ctx.reply(
        [
          "┏━━━〔 *CUACA " + city.toUpperCase() + "* 〕━━━┓",
          "┃ 🌡️  Suhu      : *" + ww.temp_C + "°C*",
          "┃ 💧  Kelembaban : *" + ww.humidity + "%*",
          "┃ 💨  Angin      : *" + ww.windspeedKmph + " km/h*",
          "┃ ☁️  Kondisi    : *" + (ww.weatherDesc?.[0]?.value || "N/A") + "*",
          "┗━━━━━━━━━━━━━━━━━━━━┛",
        ].join("\n"),
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
