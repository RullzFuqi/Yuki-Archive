import fs from "fs";
import path from "path";

export default {
  name: "cleartmp",
  category: "Owner",
  description: "Hapus file di folder tmp",
  ownerAccess: true,
  async handle({ ctx }) {
    const dir = "./tmp";
    if (!fs.existsSync(dir)) return ctx.reply("❌ Folder tmp tidak ada.");
    let n = 0;
    for (const f of fs.readdirSync(dir)) {
      try {
        fs.unlinkSync(path.join(dir, f));
        n++;
      } catch {}
    }
    ctx.reply("✅ Hapus *" + n + "* file dari tmp.");
  },
};
