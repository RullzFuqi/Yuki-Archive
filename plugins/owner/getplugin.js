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
  name: "getplugin",
  category: "Owner",
  description: "Ambil source code plugin",
  ownerAccess: true,
  command: ["getplugin", "gp"],
  async handle({ ctx, sock }) {
    if (!ctx.hasArgs) return ctx.reply("❌ Masukkan nama plugin.");
    const file = ctx.argsStr.endsWith(".js")
      ? ctx.argsStr
      : ctx.argsStr.toLowerCase().replace(/\s+/g, "_") + ".js";
    const found = walk(path.resolve("./plugins")).find(
      (f) => path.basename(f) === file,
    );
    if (!found) return ctx.reply("❌ Plugin *" + file + "* tidak ditemukan.");
    const code = fs.readFileSync(found, "utf-8");
    await sock.sendMessage(
      ctx.chatId,
      { text: "```\n" + code.slice(0, 3000) + "\n```" },
      { quoted: ctx._msg },
    );
  },
};
