import axios from "axios";

export default {
  name: "tourl",
  category: "Tools",
  description: "Upload media ke catbox.moe",
  command: ["tourl", "upload"],
  async handle({ ctx, sock }) {
    const isQ =
      ctx.isQuoted &&
      ["imageMessage", "videoMessage", "audioMessage"].includes(ctx.quotedType);
    if (!ctx.isMedia && !isQ) return ctx.reply("❌ Kirim atau reply media.");
    await ctx.react("⏳");
    try {
      const buf = isQ ? await ctx.downloadQuoted() : await ctx.download();
      const ext = ctx.mimetype?.split("/")?.[1] || "jpg";
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
            '\r\nContent-Disposition: form-data; name="fileToUpload"; filename="f.' +
            ext +
            '"\r\nContent-Type: ' +
            (ctx.mimetype || "image/jpeg") +
            "\r\n\r\n",
        ),
        buf,
        Buffer.from("\r\n--" + bd + "--\r\n"),
      ]);
      const res = await axios.post("https://catbox.moe/user/api.php", body, {
        headers: { "Content-Type": "multipart/form-data; boundary=" + bd },
        timeout: 30000,
      });
      const url = typeof res.data === "string" ? res.data.trim() : "";
      if (!url.startsWith("http")) return ctx.reply("❌ Upload gagal.");
      ctx.reply("✅ " + url);
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
