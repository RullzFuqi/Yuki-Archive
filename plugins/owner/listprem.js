export default {
  name: "listprem",
  category: "Owner",
  description: "Daftar user premium",
  ownerAccess: true,
  command: ["listprem", "daftarprem"],
  async handle({ ctx }) {
    const prems = Object.entries(global.db.users).filter(
      ([, u]) => u.premium?.on,
    );
    if (!prems.length) return ctx.reply("📋 Tidak ada pengguna premium.");
    const lines = ["┏━━━〔 *DAFTAR PREMIUM* 〕━━━┓", "┃"];
    prems.forEach(([jid, u]) => {
      const exp = u.premium.expiredAt
        ? new Date(u.premium.expiredAt).toLocaleDateString("id-ID")
        : "Permanen";
      lines.push("┃ 💎  +" + jid.split("@")[0], "┃     Expired: " + exp);
    });
    lines.push("┃", "┗━━━ Total: *" + prems.length + "* ━━━┛");
    ctx.reply(lines.join("\n"));
  },
};
