import { writeFile, unlink, readFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
const run = promisify(exec);

export default {
  name: "toimg",
  category: "Maker",
  description: "Ubah stiker jadi gambar",
  command: ["toimg", "s2img"],
  async handle({ ctx, sock }) {
    const isQ = ctx.isQuoted && ctx.quotedType === "stickerMessage";
    const is = ctx.type === "stickerMessage";
    if (!is && !isQ) return ctx.reply("❌ Reply stiker.");
    await ctx.react("⏳");
    const i = path.join(tmpdir(), "ti_" + Date.now() + ".webp");
    const o = path.join(tmpdir(), "ti_" + Date.now() + ".png");
    try {
      await writeFile(
        i,
        isQ ? await ctx.downloadQuoted() : await ctx.download(),
      );
      await run('ffmpeg -y -i "' + i + '" "' + o + '"');
      await sock.sendMessage(
        ctx.chatId,
        { image: await readFile(o), caption: "✅ Done!" },
        { quoted: ctx._msg },
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    } finally {
      unlink(i).catch(() => {});
      unlink(o).catch(() => {});
    }
  },
};
