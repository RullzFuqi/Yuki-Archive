import axios from "axios";

export default {
  name: "wiki",
  category: "Search",
  description: "Cari di Wikipedia",
  command: ["wiki", "wikipedia"],
  async handle({ ctx }) {
    if (!ctx.hasArgs) return ctx.reply("❌ .wiki <kata kunci>");
    await ctx.react("⏳");
    try {
      const res = await axios.get(
        "https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=" +
          encodeURIComponent(ctx.argsStr) +
          "&format=json&srlimit=1",
      );
      const page = res.data?.query?.search?.[0];
      if (!page) return ctx.reply("❌ Tidak ditemukan.");
      const det = await axios.get(
        "https://id.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=" +
          encodeURIComponent(page.title) +
          "&format=json",
      );
      const ext =
        Object.values(det.data?.query?.pages)[0]?.extract?.slice(0, 600) ||
        "Tidak ada deskripsi.";
      ctx.reply(
        "┏━━━〔 *" +
          page.title.toUpperCase() +
          "* 〕━━━┓\n┃\n" +
          ext
            .split("\n")
            .slice(0, 5)
            .map((l) => "┃ " + l)
            .join("\n") +
          "\n┃\n┃ 🔗 https://id.wikipedia.org/wiki/" +
          encodeURIComponent(page.title) +
          "\n┗━━━━━━━━━━━━━━━━━━━━┛",
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
