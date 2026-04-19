import axios from "axios";

export default {
  name: "github",
  category: "Search",
  description: "Stalk profil GitHub user",
  command: ["github", "ghstalk"],
  async handle({ ctx }) {
    const username = ctx.argsStr.trim();
    if (!username) return ctx.reply("❌ .github <username>");
    await ctx.react("⏳");
    try {
      const [uRes, rRes] = await Promise.all([
        axios.get("https://api.github.com/users/" + username, {
          timeout: 10000,
        }),
        axios.get(
          "https://api.github.com/users/" +
            username +
            "/repos?sort=stars&per_page=3",
          { timeout: 10000 },
        ),
      ]);
      const u = uRes.data;
      const repos =
        rRes.data
          .map((r) => "┃    • " + r.name + " ⭐" + r.stargazers_count)
          .join("\n") || "┃    tidak ada";
      ctx.adReply(
        u.avatar_url,
        [
          "┏━━━〔 *GITHUB: " + u.login + "* 〕━━━┓",
          "┃ 👤  " + (u.name || u.login),
          "┃ 📝  " + (u.bio || "tidak ada").slice(0, 50),
          "┃ 📦  Repos    : *" + u.public_repos + "*",
          "┃ 👥  Followers: *" + u.followers + "*",
          "┃",
          "┃ 🌟 Top Repos:",
          repos,
          "┃",
          "┃ 🔗  " + u.html_url,
          "┗━━━━━━━━━━━━━━━━━━━━┛",
        ].join("\n"),
      );
      ctx.react("✅");
    } catch {
      ctx.react("❌");
      ctx.reply("❌ User tidak ditemukan: " + username);
    }
  },
};
