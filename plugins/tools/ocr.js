import axios from "axios";

export default {
  name: "ocr",
  category: "Tools",
  description: "Baca teks dari gambar",
  command: ["ocr", "bacateks"],
  limitRequired: 1,
  async handle({ ctx }) {
    const isQ = ctx.isQuoted && ctx.quotedType === "imageMessage";
    const is = ctx.isMedia && ctx.mediaType === "image";
    if (!is && !isQ) return ctx.reply("❌ Kirim atau reply gambar.");
    await ctx.react("⏳");
    try {
      const buf = isQ ? await ctx.downloadQuoted() : await ctx.download();
      const res = await axios.post(
        "https://api.ocr.space/parse/image",
        new URLSearchParams({
          base64Image: "data:image/jpeg;base64," + buf.toString("base64"),
          language: "eng",
          apikey: "helloworld",
        }),
      );
      const text = res.data?.ParsedResults?.[0]?.ParsedText?.trim();
      if (!text) return ctx.reply("❌ Tidak ada teks terdeteksi.");
      ctx.reply(
        "┏━━━〔 *HASIL OCR* 〕━━━┓\n┃\n" +
          text
            .slice(0, 800)
            .split("\n")
            .map((l) => "┃ " + l)
            .join("\n") +
          "\n┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
