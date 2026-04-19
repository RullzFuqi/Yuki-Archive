export default {
  name: "stats",
  category: "General",
  description: "Top command hits",
  ownerAccess: true,
  async handle({ ctx }) {
    const sorted = Object.entries(global.db.stats || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20);
    if (!sorted.length) return ctx.reply("📊 Belum ada data stats.");
    const lines = ["📊 *TOP COMMAND HITS*", ""];
    sorted.forEach(([cmd, hits], i) =>
      lines.push(
        i + 1 + ". " + (ctx.prefix || ".") + cmd + " — *" + hits + "x*",
      ),
    );
    ctx.reply(lines.join("\n"));
  },
};
