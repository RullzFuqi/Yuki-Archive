import { writeFile, unlink, readFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
const run = promisify(exec);

export default {
  name: "tovn",
  category: "Maker",
  description: "Konversi audio/video ke voice note",
  command: ["tovn", "tovoicenote"],
  async handle({ ctx, sock }) {
    const isQ =
      ctx.isQuoted && ["audioMessage", "videoMessage"].includes(ctx.quotedType);
    const is = ctx.isMedia && ["audio", "video"].includes(ctx.mediaType);
    if (!is && !isQ) return ctx.reply("❌ Kirim atau reply audio/video.");
    await ctx.react("⏳");
    const i = path.join(tmpdir(), "tvn_" + Date.now());
    const o = path.join(tmpdir(), "tvn_" + Date.now() + ".ogg");
    try {
      await writeFile(
        i,
        isQ ? await ctx.downloadQuoted() : await ctx.download(),
      );
      await run('ffmpeg -y -i "' + i + '" -c:a libopus -b:a 128k "' + o + '"');
      await sock.sendMessage(
        ctx.chatId,
        {
          audio: await readFile(o),
          mimetype: "audio/ogg; codecs=opus",
          ptt: true,
        },
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
