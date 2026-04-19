import { writeFile, unlink, readFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { writeExifImg, writeExifVid } from "../../lib/exif.js";

export default {
  name: "sticker",
  category: "Maker",
  description: "Ubah gambar/video jadi stiker",
  command: ["sticker", "s", "stiker", "stk"],
  async handle({ ctx, sock }) {
    const isQ =
      ctx.isQuoted &&
      ["imageMessage", "videoMessage", "stickerMessage"].includes(
        ctx.quotedType,
      );
    const isM = ctx.isMedia && ["image", "video"].includes(ctx.mediaType);
    if (!isM && !isQ) return ctx.reply("❌ Kirim atau reply gambar/video.");
    await ctx.react("⏳");
    try {
      const buf = isQ ? await ctx.downloadQuoted() : await ctx.download();
      const vid =
        ctx.mediaType === "video" || ctx.quotedType === "videoMessage";
      const meta = {
        packname: global.bot?.sticker?.packname || "Yuki",
        author: global.bot?.sticker?.author || "YukiBot",
      };
      const sticker = vid
        ? await writeExifVid(buf, meta)
        : await writeExifImg(buf, meta);
      await sock.sendMessage(ctx.chatId, { sticker }, { quoted: ctx._msg });
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
