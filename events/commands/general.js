import { runtime, imgResize, font, getBuffer} from "#utils/tools";
import { contactQuoted, simpleQuoted } from '#library/fakeQuoted';
import db from "#utils/database";
import "#events/config";
import fs from "fs";

export default [
  {
    name: "menu",
    aliases: ["main", "help"],
    description: "Menampilkan Menu Bot",
    category: "General",
    execute: async (fuqi, ctx, msg) => {
      const rows = Object.keys(global.loader.getCommandsByCategory())
        .sort()
        .map((cat) => {
          let icl = "📁";
          let em = cat.toLowerCase();
          if (em.includes("general")) icl = "📂";
          else if (em.includes("rpg")) icl = "🔮";
          else if (em.includes("downloader")) icl = "📥";
          else if (em.includes("tools")) icl = "🧰";
          else if (em.includes("maker")) icl = "🎨";
          else if (em.includes("owner")) icl = "👑";
          else if (em.includes("random")) icl = "🧩";
          else if (em.includes("search")) icl = "🔎";
          else if (em.includes("stalker")) icl = "🕵";

          return {
            title: `${icl} ${cat}`,
            description: `${global.loader.getCommandsByCategory()[cat].length} commands`,
            id: `!info ${cat}`,
          };
        });

      await fuqi.sendMessage(
        ctx.id,
        {
          image: { url: global.bot.media.banner1 },
          jpegThumbnail: await imgResize(global.bot.media.icon1, 400, 400),
          mimetype: "image/jpeg",
          document: fs.readFileSync("./package.json"),
          fileName: `© ${global.bot?.name || "Bot"}`,
          fileLength: 30000,
          pageCount: 99,
          caption: `Hello *${msg.pushName || "User"}*
\`〔 USER INFO 〕\`
*› Number :* +${ctx.sender.split("@")[0]}
*› Name   :* ${msg.pushName || "User"}
*› Status :* ${global.db?.user?.[ctx.sender]?.status || "FREE USER"}

\`〔 BOT INFO 〕\`
*› Name    :* ${global.bot.name}
*› Version :* v${global.bot.versions}
*› Author  :* ${global.bot.author.name}
*› Runtime :* ${runtime(process.uptime())}
*› Fitur   :* ${Object.values(global.loader.getCommandsByCategory()).flat().length}

\`〔 GUIDE 〕\`
Use *!allmenu* to see all features`,
          buttons: [
            {
              buttonId: "SELECT_MENU",
              buttonText: { displayText: "MENU_LIST" },
              type: 4,
              nativeFlowInfo: {
                name: "single_select",
                paramsJson: JSON.stringify({
                  title: "Pilih Kategori Menu",
                  sections: [
                    {
                      title: "Menu Category List",
                      rows: rows,
                    },
                  ],
                }),
              },
            },
          ],
          contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid:
                global.bot.utils.newsletterJid || "1u0000@newsletter",
              newsletterName:
                global.bot.utils.newsletterName || "Lihat Saluran",
            },
            externalAdReply: {
              title: global.bot.utils.title,
              body: global.bot.utils.body,
              thumbnailUrl: global.bot.media.banner2,
              sourceUrl: global.bot.utils.source_urls,
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        },
        { quoted: contactQuoted(ctx) },
      );
    },
  },
{
    name: "allmenu",
    aliases: ["list", "commands", "category"],
    description: "Menampilkan semua command atau per kategori",
    category: "General",
    execute: async (fuqi, ctx, msg) => {
      try {
        let categories = global.loader.getCommandsByCategory();
        let catName = ctx.args[0]?.toLowerCase();
        let matchedCategory = null;
        if (catName) {
          matchedCategory = Object.keys(categories).find(
            key => key.toLowerCase() === catName.toLowerCase()
          );
        }
        
        if (catName && matchedCategory) {
          let bold_font = font(matchedCategory.toUpperCase(), "bold").toUpperCase()
          let cmds = categories[matchedCategory];
          let text = `_Welcome to All Menu ${msg.pushName || "User"}. Disini anda bisa melihat semua fitur-fitur bagian ${matchedCategory} yang tersedia dari bot._\n\n\`〣─「 ${bold_font} 」─〣\`\n`;
          cmds.forEach((cmd) => {
            const cmdName = cmd.text.replace("!", "").split(" ")[0];
            text += `\`│々\` .${cmdName}\n`;
          });
          text += `\`⇲ TOTAL COMMANDS:\` *${cmds.length}*`;
          
          await fuqi.sendMessage(ctx.id, { 
            caption: text,
            image: { url: global.bot.media.banner1 },
            contextInfo: {
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid:
                global.bot.utils.newsletterJid || "1u0000@newsletter",
                newsletterName:
                global.bot.utils.newsletterName || "Lihat Saluran",
              },
              externalAdReply: {
                title: global.bot.utils.title,
                body: global.bot.utils.body,
                thumbnailUrl: global.bot.media.icon2,
                sourceUrl: global.bot.utils.source_urls,
                mediaType: 1,
                mediaUrl: global.bot.media.icon2,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: contactQuoted(ctx)});
          
        } else if (catName && !matchedCategory) {
          const list = Object.keys(categories)
            .sort()
            .map((c) => `• ${c}`)
            .join("\n");
          await ctx.reply(
            `*Category "${catName}" tidak ditemukan*\n\n*Available Categories:*\n${list}\n\nUse *!allmenu [category]*`,
          );
        } else {
          const totalCmd = Object.values(categories).flat().length;
          const categoryCount = Object.keys(categories).length;
          const uptime = runtime(process.uptime());
          
          let text = `_Welcome to All Menu ${msg.pushName || "User"}. Disini anda bisa melihat semua fitur-fitur yang tersedia dari bot._\n\n\`〔 INFO 〕\`\n*› Command  :* ${totalCmd}\n*› Cmd Type  :* Plugins\n*› Category    :* ${categoryCount}\n*› Runtime :* ${uptime}\n\n`;

          for (const [cat, cmds] of Object.entries(categories).sort()) {
            let bold_font = font(cat.toUpperCase(), "bold").toUpperCase()
            text += `\`〣─「 ${bold_font} 」─〣\`\n`;
            cmds.forEach((cmd) => {
              const cmdName = cmd.text.replace("!", "").split(" ")[0];
              text += `\`│々\` .${cmdName}\n`;
            });
            text += `\`⇲ TOTAL COMMANDS:\` *${cmds.length}*\n\n`;
          }

          const chunks = [];
          const maxLength = 4000;

          if (text.length > maxLength) {
            let current = "";
            for (const line of text.split("\n")) {
              if ((current + line + "\n").length > maxLength) {
                chunks.push(current);
                current = line + "\n";
              } else {
                current += line + "\n";
              }
            }
            if (current) chunks.push(current);
          } else {
            chunks.push(text);
          }

          for (let i = 0; i < chunks.length; i++) {
            await fuqi.sendMessage(ctx.id, { 
            caption: (i === 0 ? "" : `*Page ${i + 1}/${chunks.length}*\n\n`) + chunks[i],
            image: { url: global.bot.media.banner1 },
            contextInfo: {
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid:
                global.bot.utils.newsletterJid || "1u0000@newsletter",
                newsletterName:
                global.bot.utils.newsletterName || "Lihat Saluran",
              },
              externalAdReply: {
                title: global.bot.utils.title,
                body: global.bot.utils.body,
                thumbnailUrl: global.bot.media.icon2,
                sourceUrl: global.bot.utils.source_urls,
                mediaType: 1,
                mediaUrl: global.bot.media.icon2,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: contactQuoted(ctx)});
          }
        }
      } catch (error) {
        console.error("Error in allmenu command:", error);
        await ctx.reply("Terjadi kesalahan saat menampilkan all menu.");
      }
    },
  },
  {
    name: "ping",
    aliases: ["pong"],
    description: "Cek respon bot",
    category: "General",
    execute: async (fuqi, ctx, msg) => {
      const start = Date.now();
      await ctx.reply("Pinging...");
      const end = Date.now();
      await ctx.edit(`Pong! *${end - start}ms*`);
    },
  },
 {
  name: 'daftarrpg',
  aliases: ['register', 'reg', 'start'],
  description: 'Daftar ke sistem RPG',
  category: 'General',
  execute: async (fuqi, ctx, msg) => {
    if (!global.db) global.db = { user: {} };
    if (!global.db.user) global.db.user = {};

    if (global.db.user[ctx.sender]) {
      return fuqi.sendMessage(ctx.id, {
        text: '❌ Kamu sudah terdaftar!\nGunakan *.profile* untuk melihat stats.'
      }, { quoted: msg });
    }

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const ppuser   = await fuqi.profilePictureUrl(ctx.sender, 'image').catch(() => 'https://telegra.ph/file/6880771a42bad09dd6087.jpg');

    global.db.user[ctx.sender] = {
      id: randomId,
      name: msg.pushName || 'User',
      ownerAcces: false,
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

    if (db?.write) await db.write(global.db);

    const teks = `╭─〔 *REGISTRASI RPG* 〕─⬿
│
│ ✅ Selamat *${msg.pushName || 'User'}*!
│ Kamu berhasil terdaftar di sistem RPG.
│
│ *ID Player :* ${randomId}
│
│ *Stats Awal*
│ ❤️ HP      : 100/100
│ 🔷 Mana    : 50/50
│ ⚔️ ATK     : 10
│ 🛡️ DEF     : 5
│ 💰 Money   : 100,000
│
│ *Mulai dengan:*
│ • .daily   — Ambil reward harian
│ • .adv     — Mulai petualangan
│ • .profile — Lihat profil
│ • .inv     — Lihat inventory
│ • .buy     — Beli item di toko
│
╰─〔 Yuki Archive RPG 〕─⬿`;

    await fuqi.sendMessage(ctx.id, {
      text: teks,
      contextInfo: {
        externalAdReply: {
          title: 'RPG SYSTEM',
          body: 'Registrasi Player',
          thumbnailUrl: ppuser,
          sourceUrl: '',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: simpleQuoted(ctx) });
  }
}
];
