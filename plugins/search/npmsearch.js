import axios from "axios";

export default {
  name: "npms",
  category: "Search",
  description: "Cari NPM package",
  command: ["npms", "npmsearch"],
  async handle({ ctx }) {
    const pkg = ctx.argsStr.trim();
    if (!pkg) return ctx.reply("❌ .npms <package>");
    await ctx.react("⏳");
    try {
      const res = await axios.get(
        "https://registry.npmjs.org/" + encodeURIComponent(pkg),
        { timeout: 10000 },
      );
      const data = res.data;
      const latest = data["dist-tags"]?.latest;
      const ver = data.versions?.[latest] || {};
      ctx.reply(
        [
          "┏━━━〔 *NPM: " + data.name + "* 〕━━━┓",
          "┃ 🔖  Versi    : *" + latest + "*",
          "┃ 📝  " + (data.description || "N/A").slice(0, 60),
          "┃ 👤  " + (ver.author?.name || data.author?.name || "N/A"),
          "┃ 🔗  https://npmjs.com/package/" + data.name,
          "┗━━━━━━━━━━━━━━━━━━━━┛",
        ].join("\n"),
      );
      ctx.react("✅");
    } catch {
      ctx.react("❌");
      ctx.reply("❌ Package tidak ditemukan: " + pkg);
    }
  },
};
