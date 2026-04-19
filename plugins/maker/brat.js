import axios from "axios";
import fs from "fs";
import path from "path";
import { writeExifImg } from "../../lib/exif.js";

export default {
  name: "brat",
  category: "Maker",
  description: "Buat stiker brat dari teks",
  command: ["brat", "makebrat"],
  async handle({ tri, msg, ctx }) {
    let t = (ctx.argsStr || "").trim();
    if (!t)
      return tri.sendMessage(
        ctx.chatId,
        { text: "Masukkan teks brat." },
        { quoted: msg },
      );
    let f = `../../tmp/brat-${t
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 50)}.webp`;
    if (fs.existsSync(f))
      return tri.sendMessage(
        ctx.chatId,
        { sticker: fs.readFileSync(f) },
        { quoted: msg },
      );
    axios
      .get(
        "https://aqul-brat.hf.space/api/brat?text=" + encodeURIComponent(t),
        { responseType: "arraybuffer" },
      )
      .then((r) =>
        writeExifImg(
          r.data,
          { packname: "Shinsō Yuki", author: "RullzFuqi" },
          false,
        ),
      )
      .then(
        (b) => (
          fs.mkdirSync(path.dirname(f), { recursive: true }),
          fs.writeFileSync(f, b),
          b
        ),
      )
      .then((b) => tri.sendMessage(ctx.chatId, { sticker: b }, { quoted: msg }))
      .catch(() =>
        tri.sendMessage(
          ctx.chatId,
          { text: "Gagal membuat sticker brat." },
          { quoted: msg },
        ),
      );
  },
};
