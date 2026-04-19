export default {
  name: "listresponse",
  category: "Owner",
  description: "Daftar auto-response",
  ownerAccess: true,
  command: ["listresponse", "listrespon"],
  async handle({ ctx }) {
    const keys = Object.keys(global.db.response || {});
    if (!keys.length) return ctx.reply("📋 Belum ada response.");
    const lines = keys.map(
      (k, i) =>
        i +
        1 +
        ". `" +
        k +
        "` — " +
        (Object.keys(global.db.response[k])[0] || "?"),
    );
    ctx.reply("*LIST RESPONSE* (" + keys.length + ")\n\n" + lines.join("\n"));
  },
};
