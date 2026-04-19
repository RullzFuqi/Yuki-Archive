import fs from "fs";
import path from "path";
const walk = (d) =>
  fs.existsSync(d)
    ? fs
        .readdirSync(d, { withFileTypes: true })
        .flatMap((e) =>
          e.isDirectory()
            ? walk(path.join(d, e.name))
            : e.name.endsWith(".js")
              ? [path.join(d, e.name)]
              : [],
        )
    : [];

export default {
  name: "delplugin",
  category: "Owner",
  description: "Hapus plugin",
  ownerAccess: true,
  command: ["delplugin", "delcommand"],
  async handle({ ctx }) {
    if (!ctx.hasArgs) return ctx.reply("❌ Masukkan nama plugin.");
    const file = ctx.argsStr.endsWith(".js")
      ? ctx.argsStr
      : ctx.argsStr.toLowerCase().replace(/\s+/g, "_") + ".js";
    const found = walk(path.resolve("./plugins")).find(
      (f) => path.basename(f) === file,
    );
    if (!found) return ctx.reply("❌ Plugin *" + file + "* tidak ditemukan.");
    if (global.pluginLoader) global.pluginLoader.unload(found);
    fs.unlinkSync(found);
    ctx.reply("✅ Plugin *" + file + "* dihapus.");
  },
};
