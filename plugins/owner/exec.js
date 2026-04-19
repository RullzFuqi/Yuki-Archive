import { exec } from "child_process";
import { promisify } from "util";
const run = promisify(exec);

export default {
  name: "exec",
  category: "Owner",
  description: "Jalankan perintah shell",
  ownerAccess: true,
  command: ["exec", "shell", "$"],
  async handle({ ctx }) {
    if (!ctx.hasArgs) return ctx.reply("❌ Masukkan perintah.");
    try {
      const { stdout, stderr } = await run(ctx.argsStr, { timeout: 30000 });
      ctx.reply(
        "```\n" +
          (stdout || stderr || "(no output)").trim().slice(0, 3000) +
          "\n```",
      );
    } catch (e) {
      ctx.reply("❌ " + e.message);
    }
  },
};
