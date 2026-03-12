import * as Baileys from 'baileys';
import chalk from 'chalk';
import { getExpNeeded } from '#cmds/rpg';
import { contactQuoted } from '#library/fakeQuoted';
import db from '#utils/database';

export async function UpsertMsgHandle(fuqi, msg, ctx, { cmd }) {
  let command = cmd.getCommand(ctx.cmd);
  if (ctx.cmd) {
    console.log(chalk.cyanBright(`[${ctx.sender}]`) + chalk.hex("#e01717")(" ➤ ") + chalk.whiteBright(`${ctx.cmd} `) + chalk.blueBright(`${ctx.group ? "GROUP" : "PRIVATE"}`));
    if (command) {
      if (command.category === 'RPG' && ctx.cmd !== 'daftarrpg' && ctx.cmd !== 'register' && ctx.cmd !== 'reg' && ctx.cmd !== 'start') {
        if (!global.db?.user?.[ctx.sender]) {
          return ctx.reply("❌ Kamu belum terdaftar di sistem RPG!\nGunakan *!daftarrpg* untuk mendaftar.");
        }
      }
      await command.execute(fuqi, ctx, msg);
      if (global.db?.user?.[ctx.sender] && command.category === 'RPG') {
        const user = global.db.user[ctx.sender];
        let needed = getExpNeeded(user.level);
        while (user.exp >= needed) {
          user.exp -= needed;
          user.level++;
          user.hpMax += 20;
          user.manaMax += 10;
          user.atk += 3;
          user.def += 2;
          user.hp = user.hpMax;
          user.mana = user.manaMax;

          await fuqi.sendMessage(ctx.id, {
            text: `╭─〔 *LEVEL UP* 〕─⬿
│
│ ✨ Selamat *${user.name}*!
│ Kamu naik ke level *${user.level}*!
│
│ *Bonus Stats:*
│ • HP Max   : +20 (${user.hpMax})
│ • Mana Max : +10 (${user.manaMax})
│ • ATK      : +3 (${user.atk})
│ • DEF      : +2 (${user.def})
│
╰─〔 Yuki Archive RPG 〕─⬿`,
            contextInfo: {
              externalAdReply: {
                title: 'LEVEL UP',
                body: `${user.name} | Level ${user.level}`,
                thumbnailUrl: 'https://imgbly.com/ib/Vz1coWp6j0FDKCo_1773200786.jpg',
                sourceUrl: '',
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: contactQuoted(ctx) });
          
          needed = getExpNeeded(user.level);
        }
        if (db?.write) await db.write(global.db);
      }
    }
  }
}