import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
const run = promisify(exec);

export default {
  name: "backupscript",
  category: "Owner",
  description: "Backup semua file script bot",
  ownerAccess: true,
  command: ["backupscript", "backup"],
  async handle({ ctx, sock }) {
    await ctx.react("⏳");
    const ts = Date.now();
    const tmpDir = "./tmp";
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const zipPath = path.join(tmpDir, "backup-" + ts + ".zip");
    try {
      await run(
        'zip -r "' +
          zipPath +
          '" . -x "node_modules/*" "session/*" "*.session" ".git/*" "tmp/*" ".env" "*.log"',
        { timeout: 60000 },
      );
      const buf = fs.readFileSync(zipPath);
      await sock.sendMessage(
        ctx.chatId,
        {
          document: buf,
          fileName: "yuki-backup-" + ts + ".zip",
          mimetype: "application/zip",
          caption:
            "📦 *Script Backup*\n⏰ " + new Date(ts).toLocaleString("id-ID"),
        },
        { quoted: ctx._msg },
      );
      await ctx.react("✅");
    } catch (e) {
      await ctx.react("❌");
      ctx.reply("❌ Backup gagal: " + e.message);
    } finally {
      fs.unlink(zipPath, () => {});
    }
  },
};
