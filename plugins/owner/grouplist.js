export default {
  name: "grouplist",
  category: "Owner",
  description: "Daftar grup bot",
  ownerAccess: true,
  command: ["grouplist", "listgroup"],
  async handle({ ctx, sock }) {
    const groups = Object.keys(global.db.groups || {});
    if (!groups.length)
      return ctx.reply("📋 Bot belum bergabung grup manapun.");
    const lines = ["┏━━━〔 *DAFTAR GRUP* 〕━━━┓", "┃"];
    let n = 1;
    for (const gid of groups) {
      try {
        const meta = await sock.groupMetadata(gid).catch(() => null);
        lines.push(
          "┃ " + n++ + ". *" + (meta?.subject || gid.split("@")[0]) + "*",
          "┃    👥 " + (meta?.participants?.length || "?") + " member",
        );
      } catch {
        lines.push("┃ " + n++ + ". " + gid.split("@")[0]);
      }
    }
    lines.push("┃", "┗━━━ Total: *" + groups.length + "* ━━━┛");
    ctx.reply(lines.join("\n"));
  },
};
