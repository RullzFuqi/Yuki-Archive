import axios from "axios";
import { simpleQuoted } from '#library/fakeQuoted';

export default [
  {
    name: "loli",
    aliases: ["randomloli"],
    description: "Mengirim gambar loli random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await axios.get("https://api.nekolabs.web.id/random/loli", {
          responseType: "arraybuffer"
        });
        
        await fuqi.sendMessage(
          ctx.id,
          {
            image: Buffer.from(res.data),
            caption: "┏━━━〔 RANDOM LOLI 〕━━━┓\n┃            🎀            ┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
            contextInfo: {
              externalAdReply: {
                title: "Random Loli",
                body: "Image Loli Random",
                mediaType: 1,
                thumbnailUrl: global.bot?.media?.icon1 || "",
                sourceUrl: "https://nekolabs.web.id",
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil gambar loli: ${error.message}`);
      }
    }
  },
  {
    name: "animequote",
    aliases: ["animequoted", "nimequote", "nimequoted", "quoteanime"],
    description: "Mendapatkan quote random dari anime",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await fetch("https://api.some-random-api.com/animu/quote");
        const data = await res.json();
        
        const teks = 
`┏━━━〔 ANIME QUOTE 〕━━━┓
┃
┃ “${data.quote}”
┃
┃ — ${data.character || data.name}
┃ Anime: ${data.anime}
┃
┗━━━━━━━━━━━━━━━━━━━━┛`;

        await ctx.reply(teks);
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil quote anime: ${error.message}`);
      }
    }
  },
  {
    name: "quote",
    aliases: ["quotes", "kata", "randomquote"],
    description: "Mendapatkan quote random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await fetch("https://zenquotes.io/api/random");
        const data = await res.json();
        const q = data[0];
        
        const teks = 
`┏━━━〔 RANDOM QUOTE 〕━━━┓
┃
┃ “${q.q}”
┃
┃ — ${q.a}
┃
┗━━━━━━━━━━━━━━━━━━━━┛`;

        await ctx.reply(teks);
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil quote: ${error.message}`);
      }
    }
  },
  {
    name: "sonicmeme",
    aliases: ["sonic", "memesonic"],
    description: "Mengirim meme sonic random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const n = Math.floor(Math.random() * 33) + 1;
        const url = `https://raw.githubusercontent.com/RullzFuqi/library/main/database/meme/sonic/sonic-${n}.jpg`;
        
        await fuqi.sendMessage(
          ctx.id,
          {
            image: { url },
            caption: "┏━━━〔 SONIC MEME 〕━━━┓\n┃         🌀🌀🌀         ┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
            contextInfo: {
              externalAdReply: {
                title: "Sonic Meme",
                body: `Meme Sonic #${n}`,
                mediaType: 1,
                thumbnailUrl: url,
                sourceUrl: "https://github.com/RullzFuqi/library",
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil meme sonic: ${error.message}`);
      }
    }
  },
  {
    name: "waifu",
    aliases: ["randomwaifu", "waifurandom"],
    description: "Mengirim gambar waifu random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await axios.get(
          "https://raw.githubusercontent.com/RullzFuqi/library/main/database/random/waifu.json"
        );
        
        const waifuList = res.data;
        const randomWaifu = waifuList[Math.floor(Math.random() * waifuList.length)];
        
        await fuqi.sendMessage(
          ctx.id,
          {
            image: { url: randomWaifu.image },
            caption: `┏━━━〔 RANDOM WAIFU 〕━━━┓\n┃ Name: ${randomWaifu.name || "Unknown"}\n┃ From: ${randomWaifu.from || "Unknown"}\n┗━━━━━━━━━━━━━━━━━━━━┛`,
            contextInfo: {
              externalAdReply: {
                title: randomWaifu.name || "Random Waifu",
                body: randomWaifu.from || "Anime Character",
                mediaType: 1,
                thumbnailUrl: randomWaifu.image,
                sourceUrl: "https://github.com/RullzFuqi/library",
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil waifu: ${error.message}`);
      }
    }
  },
  {
    name: "neko",
    aliases: ["randomneko", "nekogirl"],
    description: "Mengirim gambar neko random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await axios.get("https://api.nekolabs.web.id/random/neko", {
          responseType: "arraybuffer"
        });
        
        await fuqi.sendMessage(
          ctx.id,
          {
            image: Buffer.from(res.data),
            caption: "┏━━━〔 RANDOM NEKO 〕━━━┓\n┃           😺           ┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
            contextInfo: {
              externalAdReply: {
                title: "Random Neko",
                body: "Image Neko Random",
                mediaType: 1,
                thumbnailUrl: global.bot?.media?.icon1 || "",
                sourceUrl: "https://nekolabs.web.id",
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil gambar neko: ${error.message}`);
      }
    }
  },
  {
    name: "shinobu",
    aliases: ["randomshinobu"],
    description: "Mengirim gambar shinobu random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await axios.get("https://api.nekolabs.web.id/random/shinobu", {
          responseType: "arraybuffer"
        });
        
        await fuqi.sendMessage(
          ctx.id,
          {
            image: Buffer.from(res.data),
            caption: "┏━━━〔 RANDOM SHINOBU 〕━━━┓\n┃           👘           ┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
            contextInfo: {
              externalAdReply: {
                title: "Random Shinobu",
                body: "Image Shinobu Random",
                mediaType: 1,
                thumbnailUrl: global.bot?.media?.icon1 || "",
                sourceUrl: "https://nekolabs.web.id",
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil gambar shinobu: ${error.message}`);
      }
    }
  },
  {
    name: "megumin",
    aliases: ["randommegumin"],
    description: "Mengirim gambar megumin random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await axios.get("https://api.nekolabs.web.id/random/megumin", {
          responseType: "arraybuffer"
        });
        
        await fuqi.sendMessage(
          ctx.id,
          {
            image: Buffer.from(res.data),
            caption: "┏━━━〔 RANDOM MEGUMIN 〕━━━┓\n┃          ✨✨          ┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
            contextInfo: {
              externalAdReply: {
                title: "Random Megumin",
                body: "Image Megumin Random",
                mediaType: 1,
                thumbnailUrl: global.bot?.media?.icon1 || "",
                sourceUrl: "https://nekolabs.web.id",
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil gambar megumin: ${error.message}`);
      }
    }
  },
  {
    name: "bully",
    aliases: ["randombully"],
    description: "Mengirim GIF bully random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await axios.get("https://api.nekolabs.web.id/random/bully", {
          responseType: "arraybuffer"
        });
        
        await fuqi.sendMessage(
          ctx.id,
          {
            video: Buffer.from(res.data),
            gifPlayback: true,
            caption: "┏━━━〔 RANDOM BULLY 〕━━━┓\n┃           👊           ┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
            contextInfo: {
              externalAdReply: {
                title: "Random Bully",
                body: "GIF Bully Random",
                mediaType: 1,
                thumbnailUrl: global.bot?.media?.icon1 || "",
                sourceUrl: "https://nekolabs.web.id",
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil GIF bully: ${error.message}`);
      }
    }
  },
  {
    name: "cuddle",
    aliases: ["randomcuddle"],
    description: "Mengirim GIF cuddle random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await axios.get("https://api.nekolabs.web.id/random/cuddle", {
          responseType: "arraybuffer"
        });
        
        await fuqi.sendMessage(
          ctx.id,
          {
            video: Buffer.from(res.data),
            gifPlayback: true,
            caption: "┏━━━〔 RANDOM CUDDLE 〕━━━┓\n┃          🫂           ┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
            contextInfo: {
              externalAdReply: {
                title: "Random Cuddle",
                body: "GIF Cuddle Random",
                mediaType: 1,
                thumbnailUrl: global.bot?.media?.icon1 || "",
                sourceUrl: "https://nekolabs.web.id",
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil GIF cuddle: ${error.message}`);
      }
    }
  },
  {
    name: "cry",
    aliases: ["randomcry"],
    description: "Mengirim GIF cry random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await axios.get("https://api.nekolabs.web.id/random/cry", {
          responseType: "arraybuffer"
        });
        
        await fuqi.sendMessage(
          ctx.id,
          {
            video: Buffer.from(res.data),
            gifPlayback: true,
            caption: "┏━━━〔 RANDOM CRY 〕━━━┓\n┃          😢           ┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
            contextInfo: {
              externalAdReply: {
                title: "Random Cry",
                body: "GIF Cry Random",
                mediaType: 1,
                thumbnailUrl: global.bot?.media?.icon1 || "",
                sourceUrl: "https://nekolabs.web.id",
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil GIF cry: ${error.message}`);
      }
    }
  },
  {
    name: "hug",
    aliases: ["randomhug"],
    description: "Mengirim GIF hug random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await axios.get("https://api.nekolabs.web.id/random/hug", {
          responseType: "arraybuffer"
        });
        
        await fuqi.sendMessage(
          ctx.id,
          {
            video: Buffer.from(res.data),
            gifPlayback: true,
            caption: "┏━━━〔 RANDOM HUG 〕━━━┓\n┃          🤗           ┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
            contextInfo: {
              externalAdReply: {
                title: "Random Hug",
                body: "GIF Hug Random",
                mediaType: 1,
                thumbnailUrl: global.bot?.media?.icon1 || "",
                sourceUrl: "https://nekolabs.web.id",
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil GIF hug: ${error.message}`);
      }
    }
  },
  {
    name: "kiss",
    aliases: ["randomkiss"],
    description: "Mengirim GIF kiss random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await axios.get("https://api.nekolabs.web.id/random/kiss", {
          responseType: "arraybuffer"
        });
        
        await fuqi.sendMessage(
          ctx.id,
          {
            video: Buffer.from(res.data),
            gifPlayback: true,
            caption: "┏━━━〔 RANDOM KISS 〕━━━┓\n┃          💋           ┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
            contextInfo: {
              externalAdReply: {
                title: "Random Kiss",
                body: "GIF Kiss Random",
                mediaType: 1,
                thumbnailUrl: global.bot?.media?.icon1 || "",
                sourceUrl: "https://nekolabs.web.id",
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil GIF kiss: ${error.message}`);
      }
    }
  },
  {
    name: "pat",
    aliases: ["randompat"],
    description: "Mengirim GIF pat random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await axios.get("https://api.nekolabs.web.id/random/pat", {
          responseType: "arraybuffer"
        });
        
        await fuqi.sendMessage(
          ctx.id,
          {
            video: Buffer.from(res.data),
            gifPlayback: true,
            caption: "┏━━━〔 RANDOM PAT 〕━━━┓\n┃          🖐️           ┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
            contextInfo: {
              externalAdReply: {
                title: "Random Pat",
                body: "GIF Pat Random",
                mediaType: 1,
                thumbnailUrl: global.bot?.media?.icon1 || "",
                sourceUrl: "https://nekolabs.web.id",
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil GIF pat: ${error.message}`);
      }
    }
  },
  {
    name: "slap",
    aliases: ["randomslap"],
    description: "Mengirim GIF slap random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await axios.get("https://api.nekolabs.web.id/random/slap", {
          responseType: "arraybuffer"
        });
        
        await fuqi.sendMessage(
          ctx.id,
          {
            video: Buffer.from(res.data),
            gifPlayback: true,
            caption: "┏━━━〔 RANDOM SLAP 〕━━━┓\n┃          ✋           ┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
            contextInfo: {
              externalAdReply: {
                title: "Random Slap",
                body: "GIF Slap Random",
                mediaType: 1,
                thumbnailUrl: global.bot?.media?.icon1 || "",
                sourceUrl: "https://nekolabs.web.id",
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil GIF slap: ${error.message}`);
      }
    }
  },
  {
    name: "smug",
    aliases: ["randomsmug"],
    description: "Mengirim GIF smug random",
    category: "Random",
    execute: async (fuqi, ctx, msg) => {
      try {
        const res = await axios.get("https://api.nekolabs.web.id/random/smug", {
          responseType: "arraybuffer"
        });
        
        await fuqi.sendMessage(
          ctx.id,
          {
            video: Buffer.from(res.data),
            gifPlayback: true,
            caption: "┏━━━〔 RANDOM SMUG 〕━━━┓\n┃          😏           ┃\n┗━━━━━━━━━━━━━━━━━━━━┛",
            contextInfo: {
              externalAdReply: {
                title: "Random Smug",
                body: "GIF Smug Random",
                mediaType: 1,
                thumbnailUrl: global.bot?.media?.icon1 || "",
                sourceUrl: "https://nekolabs.web.id",
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil GIF smug: ${error.message}`);
      }
    }
  }
];