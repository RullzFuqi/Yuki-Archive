import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const DB_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../database",
);

export default {
  name: "getdb",
  category: "Owner",
  description: "Kirim file database",
  ownerAccess: true,
  async handle({ ctx, sock }) {
    for (const f of fs.readdirSync(DB_DIR).filter((f) => f.endsWith(".json"))) {
      await sock.sendMessage(
        ctx.chatId,
        {
          document: fs.readFileSync(path.join(DB_DIR, f)),
          fileName: f,
          mimetype: "application/json",
        },
        { quoted: ctx._msg },
      );
    }
  },
};
