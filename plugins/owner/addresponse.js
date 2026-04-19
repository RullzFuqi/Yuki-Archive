import db from "../../lib/database.js";
import { slugify } from "../../lib/tools.js";
import { getContentType } from "baileys";

export default {
  name: "addresponse",
  category: "Owner",
  description: "Tambah auto-response",
  ownerAccess: true,
  command: ["addresponse", "setrespon", "setresponse"],
  async handle({ ctx, msg }) {
    if (!ctx.isQuoted || !ctx.quoted)
      return ctx.reply("❌ *Reply* pesan yang ingin dijadikan response!");
    if (!ctx.hasArgs)
      return ctx.reply(
        "❌ Masukkan teks trigger.\nContoh: reply pesan lalu .addresponse halo",
      );
    const key = slugify(ctx.argsStr);
    if (key.length < 2) return ctx.reply("❌ Trigger terlalu pendek.");

    const m = msg.message;
    const mtype = getContentType(m);
    const stanzaId = m?.[mtype]?.contextInfo?.stanzaId;
    const quotedMsg = stanzaId ? global.msgCache?.get(stanzaId) : null;

    if (quotedMsg) {
      global.db.response[key] = quotedMsg.message;
    } else {
      global.db.response[key] = ctx.quoted;
    }

    db.write("response");
    ctx.reply(
      "✅ Response disimpan!\nTrigger: *" +
        ctx.argsStr +
        "*\n" +
        "Type: " +
        (ctx.quotedType || "unknown") +
        "\n" +
        (quotedMsg
          ? "✅ Full message tersimpan"
          : "⚠️ Partial (pesan tidak ada di cache)"),
    );
  },
};
