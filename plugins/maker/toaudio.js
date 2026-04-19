import { writeFile, unlink, readFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
const run = promisify(exec);

export default {
  name: "toaudio",
  category: "Maker",
  description: "Konversi video/audio ke MP3",
  command: ["toaudio", "tomp3"],
  async handle({ ctx, sock }) {
    const isQ =
      ctx.isQuoted && ["videoMessage", "audioMessage"].includes(ctx.quotedType);
    const is = ctx.isMedia && ["video", "audio"].includes(ctx.mediaType);
    if (!is && !isQ) return ctx.reply("❌ Kirim atau reply video/audio.");
    await ctx.react("⏳");
    const i = path.join(tmpdir(), "ta_" + Date.now());
    const o = path.join(tmpdir(), "ta_" + Date.now() + ".mp3");
    try {
      await writeFile(
        i,
        isQ ? await ctx.downloadQuoted() : await ctx.download(),
      );
      await run('ffmpeg -y -i "' + i + '" -q:a 0 -map a "' + o + '"');
      await sock.sendMessage(
        ctx.chatId,
        { audio: await readFile(o), mimetype: "audio/mpeg" },
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
