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
  name: "saveplugin",
  category: "Owner",
  description: "Update source code plugin",
  ownerAccess: true,
  command: ["saveplugin", "sp"],
  async handle({ ctx }) {
    const code = ctx.quotedText?.trim();
    if (!code) return ctx.reply("❌ Reply kode plugin baru.");
    if (!ctx.hasArgs) return ctx.reply("❌ Masukkan nama plugin.");
    const file = ctx.argsStr.endsWith(".js")
      ? ctx.argsStr
      : ctx.argsStr.toLowerCase().replace(/\s+/g, "_") + ".js";
    const found = walk(path.resolve("./plugins")).find(
      (f) => path.basename(f) === file,
    );
    if (!found)
      return ctx.reply(
        "❌ Plugin tidak ditemukan. Gunakan .addplugin untuk plugin baru.",
      );
    fs.writeFileSync(found, code);
    if (global.pluginLoader) await global.pluginLoader.reload(found);
    ctx.reply("✅ Plugin *" + file + "* diperbarui & di-reload!");
  },
};
