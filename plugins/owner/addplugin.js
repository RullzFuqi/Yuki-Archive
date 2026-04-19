import fs from "fs";
import path from "path";

export default {
  name: "addplugin",
  category: "Owner",
  description: "Tambah plugin baru",
  ownerAccess: true,
  command: ["addplugin", "addcommand"],
  async handle({ ctx }) {
    const code = ctx.quotedText?.trim();
    if (!code) return ctx.reply("❌ Reply kode plugin dulu.");
    if (!ctx.hasArgs) return ctx.reply("❌ Masukkan nama plugin.");
    const catM = code.match(/category:\s*["'](.+?)["']/);
    const cat = catM?.[1]?.toLowerCase() || "general";
    const file = ctx.argsStr.endsWith(".js")
      ? ctx.argsStr
      : ctx.argsStr.toLowerCase().replace(/\s+/g, "_") + ".js";
    const dir = path.resolve("./plugins/" + cat);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, file), code);
    if (global.pluginLoader)
      await global.pluginLoader.load(path.join(dir, file));
    ctx.reply("✅ Plugin *" + file + "* ditambahkan ke *" + cat + "*.");
  },
};
