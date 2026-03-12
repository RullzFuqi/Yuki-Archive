import axios from "axios";
import fs from "fs";
import path from "path";
import { downloadContentFromMessage } from "baileys";
import { simpleQuoted } from '#library/fakeQuoted';
import { writeExifImg } from "#library/exif";
import uploadCatbox from "#library/catbox";

const PRESET = {
  putihkan: "ubah warna objek/karakter menjadi putih bersih, realistis, detail tinggi",
  hitamkan: "ubah warna objek/karakter menjadi hitam pekat, realistis, detail tinggi",
  hijaukan: "ubah warna objek/karakter menjadi hijau natural, realistis, detail tinggi",
}; 

export default [
  {
    name: "blur",
    aliases: ["makeblur"],
    description: "Membuat efek blur pada gambar",
    category: "Maker",
    example: "reply gambar",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.isMedia) return ctx.reply("❌ Reply/kirim gambar dengan caption .blur");
        
        let buffer = Buffer.from([]);
        let stream = await downloadContentFromMessage(ctx.media, "image");
        for await (let chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        
        let imgurl = await uploadCatbox(buffer);
        let res = await axios.get(`https://api.siputzx.my.id/api/canvas/blur?image=${imgurl}`, { 
          responseType: "arraybuffer" 
        });
        
        await fuqi.sendMessage(ctx.id, {
          image: Buffer.from(res.data),
          caption: "✅ *Blur Effect*\nGambar berhasil diproses!",
          contextInfo: {
            externalAdReply: {
              title: "Blur Effect",
              body: "Image Editor",
              mediaType: 1,
              thumbnailUrl: global.bot?.media?.icon1 || "",
              sourceUrl: "",
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Gagal membuat blur: ${error.message}`);
      }
    }
  },
  {
    name: "brat",
    aliases: ["makebrat"],
    description: "Membuat sticker brat dari teks",
    category: "Maker",
    example: "teks",
    execute: async (fuqi, ctx, msg) => {
      try {
        let teks = ctx.query;
        if (!teks) return ctx.reply("❌ Masukkan teks brat.");
        
        let filename = `brat-${teks.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 50)}.webp`;
        let filepath = path.join(process.cwd(), "tmp/", filename);
        
        if (fs.existsSync(filepath)) {
          return await fuqi.sendMessage(ctx.id, {
            sticker: fs.readFileSync(filepath)
          }, { quoted: simpleQuoted(ctx) });
        }
        
        const res = await axios.get(
          "https://aqul-brat.hf.space/api/brat?text=" + encodeURIComponent(teks),
          { responseType: "arraybuffer" }
        );
        
        const stickerBuffer = await writeExifImg(
          res.data,
          { packname: "YUKI | ARCHIVE", author: "RullzFuqi" },
          false
        );
        
        fs.mkdirSync(path.dirname(filepath), { recursive: true });
        fs.writeFileSync(filepath, stickerBuffer);
        
        await fuqi.sendMessage(ctx.id, {
          sticker: stickerBuffer
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Gagal membuat sticker brat: ${error.message}`);
      }
    }
  },
  {
    name: "fakeytcomment",
    aliases: ["fakeyt", "ytcomment"],
    description: "Membuat fake YouTube comment",
    category: "Maker",
    example: "komentar",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.query) return ctx.reply("❌ Masukkan teks komentar!");
        
        let imgUser = await fuqi.profilePictureUrl(ctx.sender, "image").catch(
          () => "https://telegra.ph/file/24fa902ead26340f3df2c.png"
        );
        
        const res = await axios.get(`https://some-random-api.com/canvas/misc/youtube-comment`, {
          params: {
            avatar: imgUser,
            username: ctx.pushname || "User",
            comment: ctx.query
          },
          responseType: "arraybuffer"
        });
        
        await fuqi.sendMessage(ctx.id, {
          image: Buffer.from(res.data),
          caption: "✅ *YouTube Comment*\nBerhasil dibuat!",
          contextInfo: {
            externalAdReply: {
              title: "Fake YouTube Comment",
              body: ctx.query.slice(0, 50),
              mediaType: 1,
              thumbnailUrl: imgUser,
              sourceUrl: "",
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Gagal membuat fake comment: ${error.message}`);
      }
    }
  },
  {
    name: "fakengl",
    aliases: ["fakeng", "nglmaker"],
    description: "Membuat fake NGL message",
    category: "Maker",
    example: "teks | dark",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.query) return ctx.reply("❌ Masukkan teks.");
        
        const parts = ctx.query.split("|").map(v => v.trim());
        const text = parts[0];
        const bgColor = parts[1] || "dark";
        
        const res = await axios.get(
          `https://api.termai.cc/api/maker/ngl`,
          {
            params: {
              text: text,
              backgroundColor: bgColor,
              key: global.api?.termaiKey || "Bell409"
            },
            responseType: "arraybuffer"
          }
        );
        
        await fuqi.sendMessage(ctx.id, {
          image: Buffer.from(res.data),
          caption: "✅ *Fake NGL*\nBerhasil dibuat!",
          contextInfo: {
            externalAdReply: {
              title: "Fake NGL",
              body: text.slice(0, 50),
              mediaType: 1,
              thumbnailUrl: global.bot?.media?.icon1 || "",
              sourceUrl: "",
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Gagal membuat Fake NGL: ${error.message}`);
      }
    }
  },
  {
    name: "gura",
    aliases: ["memegura"],
    description: "Membuat meme Gura dari gambar",
    category: "Maker",
    example: "reply gambar",
    execute: async (fuqi, ctx, msg) => {
      try {
        let mediaMessage = ctx.quoted?.media;
        if (!mediaMessage) return ctx.reply("❌ Reply gambar dulu!");
        
        let stream = await downloadContentFromMessage(mediaMessage, "image");
        let buffer = Buffer.from([]);
        for await (let chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        
        let imgurl = await uploadCatbox(buffer);
        let res = await axios.get("https://api.nekolabs.web.id/canvas/gura", {
          params: { imageUrl: imgurl },
          responseType: "arraybuffer",
        });
        
        await fuqi.sendMessage(ctx.id, {
          image: Buffer.from(res.data),
          caption: "✅ *Gura Meme*\nBerhasil dibuat!",
          contextInfo: {
            externalAdReply: {
              title: "Gura Meme",
              body: "Gawr Gura Meme Generator",
              mediaType: 1,
              thumbnailUrl: global.bot?.media?.icon1 || "",
              sourceUrl: "",
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Gagal membuat Gura Meme: ${error.message}`);
      }
    }
  },
  {
    name: "img2img",
    aliases: ["editgambar", "aiimage"],
    description: "Edit gambar dengan AI (preset atau prompt bebas)",
    category: "Maker",
    example: "prompt",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.isMedia) return ctx.reply("❌ Reply *gambar* yang ingin diedit.");
        if (ctx.mediaType !== "image") return ctx.reply("❌ Media harus berupa *gambar*.");
        
        const stream = await downloadContentFromMessage(ctx.media, "image");
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        
        let prompt = ctx.query;
        if (!prompt) {
          return ctx.reply(
            `❌ Gunakan salah satu cara berikut:
• *.putihkan*
• *.hitamkan*
• *.hijaukan*

Atau prompt bebas:
• *.img2img ubah warna menjadi merah metalik*`
          );
        }
        
        let res = await axios.post(
          "https://api.termai.cc/api/img2img/edit?key=Bell409",
          { image: buffer, prompt },
          {
            headers: { "Content-Type": "application/json" },
            responseType: "arraybuffer",
            timeout: 60000,
          }
        );
        
        await fuqi.sendMessage(ctx.id, {
          image: Buffer.from(res.data),
          caption: `✅ *Img2Img Berhasil*\n\nPrompt: ${prompt}`,
          contextInfo: {
            externalAdReply: {
              title: "AI Image Editor",
              body: prompt.slice(0, 50),
              mediaType: 1,
              thumbnailUrl: global.bot?.media?.icon1 || "",
              sourceUrl: "",
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        if (error.response) {
          ctx.reply(`❌ API Error ${error.response.status}`);
        } else {
          ctx.reply(`❌ Gagal memproses gambar: ${error.message}`);
        }
      }
    }
  },
  {
    name: "putihkan",
    aliases: ["makewhite"],
    description: "Ubah warna objek menjadi putih (preset img2img)",
    category: "Maker",
    example: "reply gambar",
    execute: async (fuqi, ctx, msg) => {
      ctx.command = "putihkan";
      ctx.args = ["putihkan"];
      ctx.query = PRESET.putihkan;
      const cmd = exports.default.find(c => c.name === "img2img");
      if (cmd) await cmd.execute(fuqi, ctx, msg);
    }
  },
  {
    name: "hitamkan",
    aliases: ["makeblack"],
    description: "Ubah warna objek menjadi hitam (preset img2img)",
    category: "Maker",
    example: "reply gambar",
    execute: async (fuqi, ctx, msg) => {
      ctx.command = "hitamkan";
      ctx.args = ["hitamkan"];
      ctx.query = PRESET.hitamkan;
      const cmd = exports.default.find(c => c.name === "img2img");
      if (cmd) await cmd.execute(fuqi, ctx, msg);
    }
  },
  {
    name: "hijaukan",
    aliases: ["makegreen"],
    description: "Ubah warna objek menjadi hijau (preset img2img)",
    category: "Maker",
    example: "reply gambar",
    execute: async (fuqi, ctx, msg) => {
      ctx.command = "hijaukan";
      ctx.args = ["hijaukan"];
      ctx.query = PRESET.hijaukan;
      const cmd = exports.default.find(c => c.name === "img2img");
      if (cmd) await cmd.execute(fuqi, ctx, msg);
    }
  },
  {
    name: "iqc",
    aliases: ["iphonequote"],
    description: "Membuat iPhone Quote Chat image",
    category: "Maker",
    example: "teks | operator",
    execute: async (fuqi, ctx, msg) => {
      try {
        const input = ctx.query;
        if (!input) return ctx.reply("❌ Contoh: .iqc teks | Telkomsel");
        
        const [text, carrier = "Telkomsel"] = input.split("|").map(v => v.trim());
        const apiKey = global.api?.termaiKey || "Bell409";
        
        let params = new URLSearchParams({
          text,
          timestamp: "19:00",
          emojiType: "ios",
          statusBarTime: "19:00",
          signal: 4,
          battery: "50",
          carrier,
          key: apiKey,
        });
        
        const res = await fetch(`https://api.termai.cc/api/maker/iqc?${params}`);
        if (!res.ok) throw new Error(`API: ${res.status}`);
        
        const imageBuffer = await res.arrayBuffer();
        
        await fuqi.sendMessage(ctx.id, {
          image: Buffer.from(imageBuffer),
          mimetype: "image/png",
          caption: "✅ *iPhone Quote Chat*\nBerhasil dibuat!",
          contextInfo: {
            externalAdReply: {
              title: "iPhone Quote",
              body: text.slice(0, 50),
              mediaType: 1,
              thumbnailUrl: global.bot?.media?.icon1 || "",
              sourceUrl: "",
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Gagal membuat gambar: ${error.message}`);
      }
    }
  },
  {
    name: "remini",
    aliases: ["hd", "enhance", "remini"],
    description: "Meningkatkan kualitas gambar (HD)",
    category: "Maker",
    example: "reply gambar",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.isMedia) return ctx.reply("❌ Reply/kirim gambar dengan caption .remini");
        
        let buffer = Buffer.from([]);
        let stream = await downloadContentFromMessage(ctx.media, "image");
        for await (let chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        
        let imgurl = await uploadCatbox(buffer);
        let { data } = await axios.get("https://api.termai.cc/api/tools/remini", {
          params: { 
            url: imgurl, 
            key: global.api?.termaiKey || "Bell409" 
          }
        });
        
        if (!data?.status) throw new Error("Gagal enhance");
        
        await fuqi.sendMessage(ctx.id, { 
          image: { url: data.data.url }, 
          caption: "✅ *Enhanced!*\nKualitas gambar ditingkatkan!",
          contextInfo: {
            externalAdReply: {
              title: "Remini HD",
              body: "Image Enhancement",
              mediaType: 1,
              thumbnailUrl: global.bot?.media?.icon1 || "",
              sourceUrl: "",
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Gagal meningkatkan kualitas gambar: ${error.message}`);
      }
    }
  },
  {
    name: "tonikawa",
    aliases: ["tonikawaframe"],
    description: "Membuat gambar dengan frame Tonikawa",
    category: "Maker",
    example: "reply gambar",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.isMedia) return ctx.reply("❌ Reply/kirim gambar dengan caption .tonikawa");
        
        let buffer = Buffer.from([]);
        let stream = await downloadContentFromMessage(ctx.media, "image");
        for await (let chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        
        let res = await axios.get(
          "https://api.some-random-api.com/canvas/misc/tonikawa",
          {
            params: { avatar: await uploadCatbox(buffer) },
            responseType: "arraybuffer"
          }
        );
        
        await fuqi.sendMessage(ctx.id, {
          image: Buffer.from(res.data),
          caption: "✅ *Tonikawa Frame*\nBerhasil dibuat!",
          contextInfo: {
            externalAdReply: {
              title: "Tonikawa Frame",
              body: "Tonikawa Canvas",
              mediaType: 1,
              thumbnailUrl: global.bot?.media?.icon1 || "",
              sourceUrl: "",
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Gagal membuat gambar tonikawa: ${error.message}`);
      }
    }
  }
];