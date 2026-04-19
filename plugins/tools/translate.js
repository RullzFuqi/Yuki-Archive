import axios from "axios";

export default {
  name: "tr",
  category: "Tools",
  description: "Terjemahkan teks",
  command: ["tr", "translate", "terjemah"],
  limitRequired: 1,
  async handle({ ctx }) {
    const a = ctx.argsStr.trim().split(" ");
    const lang = a[0] || "id";
    const text = ctx.isQuoted ? ctx.quotedText : a.slice(1).join(" ");
    if (!text) return ctx.reply("❌ .tr <lang> <teks>");
    await ctx.react("⏳");
    try {
      const res = await axios.get(
        "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" +
          lang +
          "&dt=t&q=" +
          encodeURIComponent(text),
      );
      const result = res.data[0]
        ?.map((i) => i?.[0])
        .filter(Boolean)
        .join("");
      ctx.reply("🌐 *" + lang.toUpperCase() + "*\n" + result);
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
