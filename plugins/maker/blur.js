import axios from "axios";

export default {
  name: "blur",
  category: "Maker",
  description: "Efek blur pada gambar",
  command: ["blur", "makeblur"],
  limitRequired: 1,
  async handle({ ctx, sock }) {
    const isQ = ctx.isQuoted && ctx.quotedType === "imageMessage";
    const is = ctx.isMedia && ctx.mediaType === "image";
    if (!is && !isQ) return ctx.reply("❌ Kirim atau reply gambar.");
    await ctx.react("⏳");
    try {
      const buf = isQ ? await ctx.downloadQuoted() : await ctx.download();
      const bd = "Bound" + Date.now();
      const body = Buffer.concat([
        Buffer.from(
          "--" +
            bd +
            '\r\nContent-Disposition: form-data; name="reqtype"\r\n\r\nfileupload\r\n',
        ),
        Buffer.from(
          "--" +
            bd +
            '\r\nContent-Disposition: form-data; name="fileToUpload"; filename="img.jpg"\r\nContent-Type: image/jpeg\r\n\r\n',
        ),
        buf,
        Buffer.from("\r\n--" + bd + "--\r\n"),
      ]);
      const up = await axios.post("https://catbox.moe/user/api.php", body, {
        headers: { "Content-Type": "multipart/form-data; boundary=" + bd },
        timeout: 20000,
      });
      const imgUrl = typeof up.data === "string" ? up.data.trim() : "";
      const res = await axios.get(
        "https://api.siputzx.my.id/api/canvas/blur?image=" +
          encodeURIComponent(imgUrl),
        { responseType: "arraybuffer", timeout: 15000 },
      );
      await sock.sendMessage(
        ctx.chatId,
        { image: Buffer.from(res.data), caption: "✅ *Blur Effect*" },
        { quoted: ctx._msg },
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
