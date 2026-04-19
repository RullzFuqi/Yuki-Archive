import util from "util";

export default {
  name: "eval",
  category: "Owner",
  description: "Jalankan kode JS",
  ownerAccess: true,
  command: ["eval", "ev"],
  async handle({ ctx }) {
    if (!ctx.hasArgs) return ctx.reply("❌ Masukkan kode.");
    try {
      let code = ctx.argsStr.trim();

      if (!/return\s+/i.test(code)) {
        if (!code.trim().startsWith("async") && !code.includes("\n")) {
          code = "return " + code;
        }
      }

      let res = await eval("(async()=>{ " + code + " })()");

      if (typeof res !== "string") {
        res = util.inspect(res, { depth: 4, colors: false });
      }

      await ctx.reply("```\n" + res.slice(0, 3000) + "\n```");
    } catch (e) {
      await ctx.reply("❌ " + e.message);
    }
  },
};
