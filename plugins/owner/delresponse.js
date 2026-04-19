import db from "../../lib/database.js";
import { slugify } from "../../lib/tools.js";

export default {
  name: "delresponse",
  category: "Owner",
  description: "Hapus auto-response",
  ownerAccess: true,
  command: ["delresponse", "delrespon"],
  async handle({ ctx }) {
    const key = slugify(ctx.argsStr);
    if (!global.db.response[key])
      return ctx.reply('❌ Response "' + ctx.argsStr + '" tidak ditemukan.');
    delete global.db.response[key];
    db.write("response");
    ctx.reply('✅ Response "' + ctx.argsStr + '" dihapus.');
  },
};
