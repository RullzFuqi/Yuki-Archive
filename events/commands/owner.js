import fs from "fs";
import path from "path";
import crypto from "crypto";
import { exec } from "child_process";
import util from "util";
import { createReadStream } from "fs";
import { simpleQuoted } from '#library/fakeQuoted';
import db from "#utils/database";

const execAsync = util.promisify(exec);

export default [
  {
    name: "addowner",
    aliases: ["tambahowner"],
    description: "Menambahkan nomor ke daftar owner",
    category: "Owner",
    ownerAcces: true,
    execute: async (fuqi, ctx, msg) => {
      try {
        let num = ctx.args[0]?.replace(/\D/g, "");
        let jid = num 
          ? (num.includes("@s.whatsapp.net") ? num : num + "@s.whatsapp.net")
          : ctx.quoted?.sender;
          
        if (!jid) return ctx.reply("❌ Sertakan nomor owner atau reply pesan owner.");
        
    global.db.user[ctx.sender] = {
      id: randomId,
      name: msg.pushName || 'User',
      ownerAcces: true,
      premium: { on: false, expiredAt: null },
      level: 1,
      exp: 0,
      hp: 100, hpMax: 100,
      mana: 50, manaMax: 50,
      atk: 10, def: 5,
      money: 100000,
      mcoin: 0,
      equipped: { weapon: null, armor: null },
      inventory: {
        ores:      { coal: 0, stone: 0, iron: 0, gold: 0, diamond: 0, platinum: 0 },
        nature:    { wood: 0, leather: 0, spice: 0, water_jug: 0, bait: 0 },
        fruit:     { strawberry: 0, banana: 0, grape: 0, apple: 0, orange: 0 },
        vegetable: { carrot: 0, potato: 0, cabbage: 0, onion: 0, tomato: 0, corn: 0 },
        fish:      { anchovy: 0, catfish: 0, carp: 0, tuna: 0, salmon: 0, swordfish: 0, pufferfish: 0, squid: 0, shrimp: 0, clownfish: 0 },
        food:      { bread: 0, rice: 0, grilled_fish: 0, steak: 0, fruit_salad: 0, roast_chicken: 0 },
        drink:     { water: 0, juice: 0, herbal_tea: 0, mana_potion: 0, elixir: 0 },
        tools:     { pickaxe_iron: 0, pickaxe_diamond: 0, rod_wood: 0, rod_premium: 0 },
        weapon:    { sword_stone: 0, sword_iron: 0, sword_diamond: 0, sword_light: 0, sword_dark: 0 },
        armor:     { armor_leather: 0, armor_iron: 0, armor_crystal: 0 },
        crate:     { common: 0, uncommon: 0, legendary: 0, mythic: 0, secret: 0 },
      },
      cooldown: { daily: 0, adventure: 0, mine: 0, fish: 0, rest: 0 },
      createdAt: Date.now()
    };
        
        global.db.user[jid].ownerAcces = true;
        global.owner = global.owner || { number: [] };
        if (!global.owner.number.includes(jid)) global.owner.number.push(jid);
        
        if (db?.write) await db.write(global.db);
        
        await fuqi.sendMessage(ctx.id, {
          text: `✅ Berhasil menambahkan *${jid}* sebagai owner`,
          contextInfo: {
            externalAdReply: {
              title: "Owner Manager",
              body: "Add Owner",
              mediaType: 1,
              thumbnailUrl: "https://c.termai.cc/i169/Tryid9.jpg",
              sourceUrl: "",
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "delowner",
    aliases: ["hapusowner"],
    description: "Menghapus nomor dari daftar owner",
    category: "Owner",
    ownerAcces: true,
    execute: async (fuqi, ctx, msg) => {
      try {
        let num = ctx.args[0]?.replace(/\D/g, "");
        let jid = num 
          ? (num.includes("@s.whatsapp.net") ? num : num + "@s.whatsapp.net")
          : ctx.quoted?.sender;
          
        if (!jid) return ctx.reply("❌ Sertakan nomor owner atau reply pesan owner.");
        
        if (global.db.user[jid]) global.db.user[jid].ownerAcces = false;
        global.owner.number = (global.owner.number || []).filter(v => v !== jid);
        
        if (db?.write) await db.write(global.db);
        
        await fuqi.sendMessage(ctx.id, {
          text: `✅ Berhasil menghapus *${jid}* dari daftar owner`,
          contextInfo: {
            externalAdReply: {
              title: "Owner Manager",
              body: "Delete Owner",
              mediaType: 1,
              thumbnailUrl: "https://c.termai.cc/i169/Tryid9.jpg",
              sourceUrl: "",
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "addplugin",
    aliases: ["addcommand", "tambahplugin"],
    description: "Menambahkan plugin baru dengan membalas kode plugin",
    category: "Owner",
    ownerAcces: true,
    execute: async (fuqi, ctx, msg) => {
      try {
        let code = ctx.quoted?.text || "";
        if (!code) return ctx.reply("❌ Balas pesan yang berisi kode plugin.");
        
        let name = ctx.query;
        if (!name) return ctx.reply("❌ Nama plugin tidak ditemukan. Contoh: .addplugin namaplugin");
        
        let match = code.match(/category\s*:\s*["'`](.+?)["'`]/i);
        let category = (match?.[1] || "unknown").toLowerCase();
        let filename = name.endsWith(".js") ? name : `${name.replace(/\s+/g, "_").toLowerCase()}.js`;
        
        let dir = path.join(process.cwd(), "commands", category);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        fs.writeFileSync(path.join(dir, filename), code, "utf8");
        
        ctx.reply(`✅ Plugin *${filename}* disimpan di folder *${category}*`);
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "delplugin",
    aliases: ["delcommand", "hapusplugin"],
    description: "Menghapus plugin yang ada di folder commands",
    category: "Owner",
    ownerAcces: true,
    execute: async (fuqi, ctx, msg) => {
      try {
        let name = ctx.args[0];
        if (!name) return ctx.reply("❌ Nama plugin tidak ditemukan.");
        
        let filename = name.endsWith(".js") ? name : `${name.replace(/\s+/g, "_").toLowerCase()}.js`;
        let baseDir = path.join(process.cwd(), "commands");
        
        await ctx.reply("🔍 Mencari plugin...");
        
        let foundPath = null;
        let foundCategory = null;
        
        if (fs.existsSync(baseDir)) {
          let categoryList = fs.readdirSync(baseDir).filter(dir => 
            fs.statSync(path.join(baseDir, dir)).isDirectory()
          );
          
          for (let cat of categoryList) {
            let target = path.join(baseDir, cat, filename);
            if (fs.existsSync(target)) {
              foundPath = target;
              foundCategory = cat;
              break;
            }
          }
        }
        
        if (!foundPath) return ctx.reply(`❌ Plugin *${filename}* tidak ditemukan.`);
        
        fs.unlinkSync(foundPath);
        ctx.reply(`🗑️ Plugin *${filename}* berhasil dihapus dari kategori *${foundCategory}*.`);
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "saveplugin",
    aliases: ["savecommand", "sp", "updateplugin"],
    description: "Memperbarui kode plugin dengan membalas pesan berisi kode baru",
    category: "Owner",
    ownerAcces: true,
    execute: async (fuqi, ctx, msg) => {
      try {
        let code = ctx.quoted?.text || "";
        if (!code) return ctx.reply("❌ Balas pesan berisi kode plugin yang mau diperbarui.");
        
        let name = ctx.args[0];
        if (!name) return ctx.reply("❌ Nama plugin tidak ditemukan. Contoh: .saveplugin namaplugin");
        
        let filename = name.endsWith(".js") ? name : `${name.replace(/\s+/g, "_").toLowerCase()}.js`;
        let baseDir = path.join(process.cwd(), "commands");
        
        if (!fs.existsSync(baseDir)) return ctx.reply("❌ Folder commands tidak ditemukan.");
        
        await ctx.reply("🔍 Mencari plugin...");
        
        let foundPath = null;
        let foundCategory = null;
        
        let categoryList = fs.readdirSync(baseDir).filter(dir => 
          fs.statSync(path.join(baseDir, dir)).isDirectory()
        );
        
        for (let cat of categoryList) {
          let target = path.join(baseDir, cat, filename);
          if (fs.existsSync(target)) {
            foundPath = target;
            foundCategory = cat;
            break;
          }
        }
        
        if (!foundPath) return ctx.reply(`❌ Plugin *${filename}* tidak ditemukan di semua kategori.`);
        
        await ctx.reply(`✅ Plugin ditemukan di kategori *${foundCategory}*. Menyimpan...`);
        fs.writeFileSync(foundPath, code, "utf8");
        
        ctx.reply(`📝 Plugin *${filename}* berhasil diperbarui di kategori *${foundCategory}*.`);
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "getplugin",
    aliases: ["gp", "ambilplugin"],
    description: "Mengambil source kode plugins",
    category: "Owner",
    ownerAcces: true,
    execute: async (fuqi, ctx, msg) => {
      try {
        let name = ctx.args[0]?.toLowerCase();
        if (!name) return ctx.reply("❌ Masukkan nama plugin.");
        
        const walk = (dir) => {
          let results = [];
          const list = fs.readdirSync(dir, { withFileTypes: true });
          for (const item of list) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
              results = results.concat(walk(fullPath));
            } else if (item.isFile() && item.name.endsWith('.js')) {
              results.push(fullPath);
            }
          }
          return results;
        };
        
        let files = walk(path.resolve(process.cwd(), "commands"));
        let file = files.find(v => path.basename(v, ".js").toLowerCase() === name);
        
        if (!file) return ctx.reply("❌ Plugin tidak ditemukan.");
        
        let code = fs.readFileSync(file, "utf-8");
        if (code.length > 65000) return ctx.reply("❌ Kode terlalu panjang.");
        
        await fuqi.sendMessage(ctx.id, {
          text: `\`\`\`${code}\`\`\``
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "eval",
    aliases: ["=>", "ev"],
    description: "Menjalankan kode JavaScript",
    category: "Owner",
    ownerAcces: true,
    execute: async (fuqi, ctx, msg) => {
      try {
        let code = ctx.quoted?.text || ctx.query;
        if (!code) return ctx.reply("❌ Tidak ada kode.");
        
        let exec = await (async () => {
          return await eval(code);
        })();
        
        if (typeof exec !== "string") exec = util.inspect(exec, { depth: 2 });
        
        await fuqi.sendMessage(ctx.id, {
          text: "```" + exec.slice(0, 4000) + "```"
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        await fuqi.sendMessage(ctx.id, {
          text: "```" + error.message.slice(0, 4000) + "```"
        }, { quoted: simpleQuoted(ctx) });
      }
    }
  },
  {
    name: "exec",
    aliases: ["sh", "terminal"],
    description: "Menjalankan perintah terminal",
    category: "Owner",
    ownerAcces: true,
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.query) return;
      
      try {
        const { stdout, stderr } = await execAsync(ctx.query, {
          timeout: 15000,
          maxBuffer: 1024 * 500
        });
        
        const output = (stdout || stderr || "").toString().trim();
        if (!output) return;
        
        await fuqi.sendMessage(ctx.id, {
          text: output.slice(0, 4000)
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        await fuqi.sendMessage(ctx.id, {
          text: error.message.slice(0, 4000)
        }, { quoted: simpleQuoted(ctx) });
      }
    }
  },
  {
    name: "backupdb",
    aliases: ["backupdatabase", "dbbackup"],
    description: "Backup database bot",
    category: "Owner",
    ownerAcces: true,
    execute: async (fuqi, ctx, msg) => {
      try {
        let dbPath = path.join(process.cwd(), "library/database/database.json");
        if (!fs.existsSync(dbPath)) return ctx.reply("❌ Database tidak ditemukan");
        
        let dbData = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        let users = Object.keys(dbData.user || {}).length;
        let groups = Object.keys(dbData.group || {}).length;
        let commands = Object.keys(dbData.command || {}).length;
        let totalHits = Object.values(dbData.command || {}).reduce((sum, cmd) => sum + (cmd.count || 0), 0);
        
        let timestamp = Date.now();
        let backupDir = path.join(process.cwd(), "tmp/other");
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
        
        let backupPath = path.join(backupDir, `db-backup-${timestamp}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(dbData, null, 2));
        
        let fileStream = createReadStream(backupPath);
        let chunks = [];
        for await (let chunk of fileStream) chunks.push(chunk);
        
        await fuqi.sendMessage(ctx.id, {
          document: Buffer.concat(chunks),
          fileName: `database-${timestamp}.json`,
          mimetype: "application/json",
          caption: `📊 *Database Backup*\n👤 Users: ${users}\n🏠 Groups: ${groups}\n⚡ Commands: ${commands}\n🎯 Total Hits: ${totalHits}\n⏰ ${new Date(timestamp).toLocaleString("id-ID")}`,
          contextInfo: {
            externalAdReply: {
              title: "Database Backup",
              body: `Backup ${new Date(timestamp).toLocaleString("id-ID")}`,
              mediaType: 1,
              thumbnailUrl: global.bot?.media?.icon1 || "",
              sourceUrl: "",
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
        
        ctx.react("✅");
        fs.unlinkSync(backupPath);
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "backupscript",
    aliases: ["backup", "scriptbackup"],
    description: "Backup semua file script bot",
    category: "Owner",
    ownerAcces: true,
    execute: async (fuqi, ctx, msg) => {
      try {
        let root = process.cwd();
        let backupDir = path.join(root, "tmp");
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
        
        let timestamp = Date.now();
        let zipPath = path.join(backupDir, `script-${timestamp}.zip`);
        
        await ctx.reply("⏳ Membuat backup script...");
        
        exec(`cd "${root}" && zip -r "${zipPath}" . -x "node_modules/*" "session/*" "*.session" ".git/*" "tmp/*" ".env" "*.log"`, async (error) => {
          if (error) return ctx.reply("❌ Backup gagal");
          
          if (fs.existsSync(zipPath)) {
            let fileStream = createReadStream(zipPath);
            let chunks = [];
            for await (let chunk of fileStream) chunks.push(chunk);
            
            await fuqi.sendMessage(ctx.id, {
              document: Buffer.concat(chunks),
              fileName: `script-backup-${timestamp}.zip`,
              mimetype: "application/zip",
              caption: `📦 *Script Backup*\n⏰ ${new Date(timestamp).toLocaleString("id-ID")}`,
              contextInfo: {
                externalAdReply: {
                  title: "Script Backup",
                  body: `Backup ${new Date(timestamp).toLocaleString("id-ID")}`,
                  mediaType: 1,
                  thumbnailUrl: global.bot?.media?.icon1 || "",
                  sourceUrl: "",
                  renderLargerThumbnail: true
                }
              }
            }, { quoted: simpleQuoted(ctx) });
            
            ctx.react("✅");
            fs.unlinkSync(zipPath);
          }
        });
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "deluser",
    aliases: ["deleteuser", "hapususer"],
    description: "Hapus user dari database",
    category: "Owner",
    ownerAcces: true,
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.args.length) return ctx.reply(`⚡ *Format:* ${ctx.prefix}deluser [nomor]`);
        
        let number = ctx.args[0].replace(/\D/g, "").replace(/^0/, "628");
        let userId = `${number}@s.whatsapp.net`;
        
        if (!global.db.user[userId]) return ctx.reply(`❌ User ${number} tidak ditemukan`);
        
        delete global.db.user[userId];
        if (db?.write) await db.write(global.db);
        
        ctx.reply(`🗑️ *User Dihapus*\n👤 ${number}`);
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "setpremium",
    aliases: ["premiumset", "premium"],
    description: "Atur status premium user",
    category: "Owner",
    ownerAcces: true,
    execute: async (fuqi, ctx, msg) => {
      try {
        if (ctx.args.length < 3) {
          return ctx.reply(
            `⚡ *Format:* ${ctx.prefix}setpremium [nomor] [durasi] [action]\n` +
            `📦 *Durasi:* 1jam, 1hari, 1minggu, 1bulan, permanen\n` +
            `🎯 *Action:* add / min\n` +
            `✨ *Contoh:* ${ctx.prefix}setpremium 6281234567890 1bulan add`
          );
        }
        
        let number = ctx.args[0].replace(/\D/g, "").replace(/^0/, "628");
        let userId = `${number}@s.whatsapp.net`;
        
        if (!global.db.user[userId]) {
          global.db.user[ctx.sender] = {
      id: randomId,
      name: msg.pushName || 'User',
      ownerAcces: false,
      premium: { status: false, expiredAt: null },
      level: 1,
      exp: 0,
      hp: 100, hpMax: 100,
      mana: 50, manaMax: 50,
      atk: 10, def: 5,
      money: 100000,
      mcoin: 0,
      equipped: { weapon: null, armor: null },
      inventory: {
        ores:      { coal: 0, stone: 0, iron: 0, gold: 0, diamond: 0, platinum: 0 },
        nature:    { wood: 0, leather: 0, spice: 0, water_jug: 0, bait: 0 },
        fruit:     { strawberry: 0, banana: 0, grape: 0, apple: 0, orange: 0 },
        vegetable: { carrot: 0, potato: 0, cabbage: 0, onion: 0, tomato: 0, corn: 0 },
        fish:      { anchovy: 0, catfish: 0, carp: 0, tuna: 0, salmon: 0, swordfish: 0, pufferfish: 0, squid: 0, shrimp: 0, clownfish: 0 },
        food:      { bread: 0, rice: 0, grilled_fish: 0, steak: 0, fruit_salad: 0, roast_chicken: 0 },
        drink:     { water: 0, juice: 0, herbal_tea: 0, mana_potion: 0, elixir: 0 },
        tools:     { pickaxe_iron: 0, pickaxe_diamond: 0, rod_wood: 0, rod_premium: 0 },
        weapon:    { sword_stone: 0, sword_iron: 0, sword_diamond: 0, sword_light: 0, sword_dark: 0 },
        armor:     { armor_leather: 0, armor_iron: 0, armor_crystal: 0 },
        crate:     { common: 0, uncommon: 0, legendary: 0, mythic: 0, secret: 0 },
      },
      cooldown: { daily: 0, adventure: 0, mine: 0, fish: 0, rest: 0 },
      createdAt: Date.now()
    };
        }
        
        let duration = ctx.args[1].toLowerCase();
        let action = ctx.args[2].toLowerCase();
        let now = Date.now();
        let user = global.db.user[userId];
        
        let addTime = duration === "permanen" ? Number.MAX_SAFE_INTEGER : 0;
        if (!addTime) {
          let match = duration.match(/^(\d+)(jam|hari|minggu|bulan)$/);
          if (!match) return ctx.reply(`❌ Durasi invalid. Contoh: 1jam, 7hari, 1bulan`);
          
          let multipliers = {
            jam: 3600000,
            hari: 86400000,
            minggu: 604800000,
            bulan: 2592000000
          };
          addTime = parseInt(match[1]) * (multipliers[match[2]] || 0);
        }
        
        if (action === "add") {
          user.premium.expiredAt = user.premium.status && user.premium.expiredAt > now
            ? user.premium.expiredAt + addTime
            : now + addTime;
          user.premium.status = true;
          
          let expired = new Date(user.premium.expiredAt);
          let formatted = duration === "permanen"
            ? "🔮 Permanen"
            : expired.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });
          
          ctx.reply(`🎉 *Premium Aktif*\n👤 ${number}\n⏳ ${duration}\n📅 ${formatted}`);
        } else if (["min", "remove", "del"].includes(action)) {
          user.premium = { status: false, expiredAt: 0 };
          ctx.reply(`🗑️ *Premium Dinonaktifkan*\n👤 ${number}`);
        } else {
          return ctx.reply(`⚙️ Action: add / min`);
        }
        
        if (db?.write) await db.write(global.db);
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "setchat",
    aliases: ["setgroup", "groupban"],
    description: "Set status chat/grup (ban/unban)",
    category: "Owner",
    groupAcces: true,
    ownerAcces: true,
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.args.length) {
          return ctx.reply(
            `⚡ *Format:* ${ctx.prefix}setchat [action] [groupjid]\n` +
            `🔧 *Action:* ban / unban / list\n` +
            `📋 *Contoh:* ${ctx.prefix}setchat ban 120363419077105196@g.us`
          );
        }
        
        let action = ctx.args[0].toLowerCase();
        
        if (action === "list") {
          let banned = Object.entries(global.db.group || {})
            .filter(([, data]) => data.bans === true)
            .map(([jid]) => jid.split("@")[0]);
            
          if (!banned.length) return ctx.reply(`📋 Tidak ada chat/grup diban`);
          return ctx.reply(`🚫 *Chat/Grup Terban*\n` + banned.map(jid => `• ${jid}`).join("\n"));
        }
        
        if (ctx.args.length < 2) {
          return ctx.reply(`📌 Butuh groupjid. Contoh: ${ctx.prefix}setchat ban 120363419077105196@g.us`);
        }
        
        let chatId = ctx.args[1];
        if (!chatId.endsWith("@g.us")) chatId = `${chatId}@g.us`;
        
        if (!global.db.group[chatId]) {
          global.db.group[chatId] = {
            from: chatId,
            config: {
              antilink: false,
              antibot: false,
              antitagsw: false,
              groupEvent: false
            },
            bans: false
          };
        }
        
        let isBanned = global.db.group[chatId].bans === true;
        
        if (action === "ban") {
          if (isBanned) return ctx.reply(`⚠️ ${chatId.split("@")[0]} sudah diban`);
          global.db.group[chatId].bans = true;
          ctx.reply(`🚫 *Chat/Grup Dibanned*\n💬 ${chatId.split("@")[0]}`);
        } else if (action === "unban") {
          if (!isBanned) return ctx.reply(`⚠️ ${chatId.split("@")[0]} belum diban`);
          global.db.group[chatId].bans = false;
          ctx.reply(`✅ *Chat/Grup Diunban*\n💬 ${chatId.split("@")[0]}`);
        } else {
          return ctx.reply(`⚙️ *Action:* ban / unban / list`);
        }
        
        if (db?.write) await db.write(global.db);
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  }
];