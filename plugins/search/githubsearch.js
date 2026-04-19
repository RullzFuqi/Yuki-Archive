import axios from "axios";

export default {
  name: "ghsearch",
  category: "Search",
  description: "Cari repository GitHub",
  command: ["ghsearch", "githubsearch"],
  async handle({ ctx }) {
    if (!ctx.hasArgs) return ctx.reply("❌ .ghsearch <keyword>");
    await ctx.react("⏳");
    try {
      const res = await axios.get(
        "https://api.github.com/search/repositories?q=" +
          encodeURIComponent(ctx.argsStr) +
          "&per_page=5",
        { timeout: 10000 },
      );
      const list = res.data.items;
      if (!list?.length)
        return ctx.reply('❌ Tidak ditemukan: "' + ctx.argsStr + '"');
      const lines = ["┏━━━〔 *GITHUB SEARCH* 〕━━━┓", "┃"];
      list.forEach((r, i) =>
        lines.push(
          "┃ " + (i + 1) + ". *" + r.full_name + "*",
          "┃    ⭐ " + r.stargazers_count + " | 🍴 " + r.forks_count,
          "┃    📝 " + (r.description || "-").slice(0, 50),
          "┃    🔗 " + r.html_url,
          "┃",
        ),
      );
      lines.push("┗━━━━━━━━━━━━━━━━━━━━┛");
      ctx.reply(lines.join("\n"));
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
