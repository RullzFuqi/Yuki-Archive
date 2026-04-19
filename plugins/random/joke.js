import axios from "axios";

export default {
  name: "joke",
  category: "Random",
  description: "Joke random",
  command: ["joke", "randomjoke"],
  async handle({ ctx }) {
    await ctx.react("⏳");
    try {
      const res = await axios.get(
        "https://v2.jokeapi.dev/joke/Any?safe-mode&lang=en",
        { timeout: 10000 },
      );
      const j = res.data;
      const text = j.type === "single" ? j.joke : j.setup + "\n\n" + j.delivery;
      ctx.reply(
        "┏━━━〔 *RANDOM JOKE* 〕━━━┓\n┃\n┃ 😄 " +
          text +
          "\n┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
