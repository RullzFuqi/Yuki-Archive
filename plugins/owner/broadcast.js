import { delay } from "../../lib/tools.js";

export default {
  name: "broadcast",
  category: "Owner",
  description: "Broadcast ke semua grup",
  ownerAccess: true,
  command: ["broadcast", "bc"],
  async handle({ ctx, sock }) {
    if (!ctx.hasArgs) return ctx.reply("❌ Masukkan pesan.");
    const groups = Object.keys(global.db.groups || {});
    let s = 0;
    for (const g of groups) {
      try {
        await sock.sendMessage(g, { text: "📢 *Broadcast*\n\n" + ctx.argsStr });
        s++;
        await delay(700);
      } catch {}
    }
    ctx.reply("✅ Broadcast ke " + s + "/" + groups.length + " grup.");
  },
};
