import axios from "axios";

export default {
  name: "qr",
  category: "Tools",
  description: "Buat QR Code",
  command: ["qr", "qrcode"],
  async handle({ ctx, sock }) {
    if (!ctx.hasArgs) return ctx.reply("❌ .qr <teks/link>");
    await ctx.react("⏳");
    try {
      const res = await axios.get(
        "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" +
          encodeURIComponent(ctx.argsStr),
        { responseType: "arraybuffer" },
      );
      await sock.sendMessage(
        ctx.chatId,
        {
          image: Buffer.from(res.data),
          caption: "📱 QR: " + ctx.argsStr.slice(0, 50),
        },
        { quoted: ctx._msg },
      );
      ctx.react("✅");
    } catch (e) {
      ctx.react("❌");
      ctx.reply("❌ " + e.message);
    }
  },
};
