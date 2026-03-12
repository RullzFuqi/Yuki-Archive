import axios from "axios";
import fetch from "node-fetch";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { writeExifImg, writeExifVid } from "#library/exif";
import { simpleQuoted } from '#library/fakeQuoted';

const execAsync = promisify(exec);

export default [
  {
    name: "axiosget",
    aliases: ["get", "fetchget"],
    description: "Melakukan permintaan GET menggunakan axios",
    category: "Tools",
    example: "url",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.args.length) return ctx.reply("❌ Masukkan URL yang valid!");
        
        const url = ctx.query;
        const res = await axios.get(url, { responseType: "arraybuffer" });
        const contentType = res.headers["content-type"];

        if (contentType.startsWith("image/")) {
          await fuqi.sendMessage(
            ctx.id,
            { image: Buffer.from(res.data) },
            { quoted: simpleQuoted(ctx) }
          );
        } else if (contentType.startsWith("video/")) {
          await fuqi.sendMessage(
            ctx.id,
            { video: Buffer.from(res.data) },
            { quoted: simpleQuoted(ctx) }
          );
        } else if (contentType === "application/json" || contentType.includes("text/")) {
          const text = Buffer.from(res.data).toString("utf-8");
          await fuqi.sendMessage(ctx.id, { text: text.slice(0, 4000) }, { quoted: simpleQuoted(ctx) });
        } else {
          await ctx.reply("❌ Tipe file tidak didukung.");
        }
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil data: ${error.message}`);
      }
    }
  },
  {
    name: "axiospost",
    aliases: ["post", "fetchpost"],
    description: "POST request menggunakan axios dengan body JSON",
    category: "Tools",
    example: "url & bodyjson",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.args[0]) return ctx.reply("❌ Masukkan URL!");
        if (!ctx.args[1]) return ctx.reply("❌ Masukkan body JSON!");
        
        const url = ctx.args[0];
        const body = JSON.parse(ctx.args.slice(1).join(" "));
        const res = await axios.post(url, body);
        
        await fuqi.sendMessage(ctx.id, {
          text: JSON.stringify(res.data, null, 2).slice(0, 4000)
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "countryinfo",
    aliases: ["country", "negara"],
    description: "Menampilkan informasi negara",
    category: "Tools",
    example: "Indonesia",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.args.length) return ctx.reply("❌ Masukkan nama negara.\nContoh: .countryinfo Indonesia");
        
        const res = await axios.get("https://api.siputzx.my.id/api/tools/countryInfo", {
          params: { name: ctx.query }
        });
        
        const data = res.data;
        if (!data || data.status !== true) return ctx.reply("❌ Negara tidak ditemukan.");
        
        let c = data.data;
        let neighbors = c.neighbors?.map(v => `• ${v.name}`).join("\n") || "-";
        
        await fuqi.sendMessage(ctx.id, {
          image: { url: c.flag },
          caption: 
`┏━━━〔 COUNTRY INFO 〕━━━┓
┃ 🏳️ Nama: ${c.name}
┃ 🏛️ Ibu Kota: ${c.capital}
┃ 🌏 Benua: ${c.continent.name} ${c.continent.emoji}
┃ 📞 Kode Telepon: ${c.phoneCode}
┃ 💱 Mata Uang: ${c.currency}
┃ 🚗 Jalur Mengemudi: ${c.drivingSide}
┃ 🗣️ Bahasa: ${c.languages.native.join(", ")}
┃ 📐 Luas: ${c.area.squareKilometers.toLocaleString()} km²
┃ 🌐 Domain: ${c.internetTLD}
┃ 🏛️ Bentuk Negara: ${c.constitutionalForm}
┃ ⭐ Terkenal: ${c.famousFor}
┃
┃ 🧭 Tetangga:
${neighbors}
┃
┃ 🗺️ ${c.googleMapsLink}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
          contextInfo: {
            externalAdReply: {
              title: c.name,
              body: c.capital,
              mediaType: 1,
              thumbnailUrl: c.flag,
              sourceUrl: c.googleMapsLink,
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
    name: "sticker",
    aliases: ["s", "stikermaker"],
    description: "Ubah gambar/video jadi stiker",
    category: "Tools",
    example: "reply image/video",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.isMedia) return ctx.reply("❌ Harap reply gambar atau video yang ingin dijadikan stiker");
        
        let buffer = await ctx.download();
        const exif = {
          packname: `STICKER MADE BY ${global.bot?.name || "Bot"}`,
          author: "RullzFuqi",
          categories: ["🤖"]
        };

        const sticker = ctx.mediaType === "video"
          ? await writeExifVid(buffer, exif, false)
          : await writeExifImg(buffer, exif, false);

        await fuqi.sendMessage(ctx.id, { sticker }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Gagal membuat sticker: ${error.message}`);
      }
    }
  },
  {
    name: "toimg",
    aliases: ["sticker2media", "stikertoimg"],
    description: "Ubah sticker jadi media (gambar/video)",
    category: "Tools",
    example: "reply sticker",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.isMedia) return ctx.reply("❌ Harap reply sticker yang ingin dijadikan media");
        
        let buffer = await ctx.download();
        const timestamp = Date.now();
        const getPath = (ext) => path.join(process.cwd(), "tmp/", `${timestamp}.${ext}`);
        
        fs.mkdirSync("./tmp/", { recursive: true });
        fs.writeFileSync(getPath("webp"), buffer);
        
        await ctx.reply("⏳ Memproses...");
        
        const isAnimated = ctx.quoted?.stickerMessage?.isAnimated || false;
        
        if (isAnimated) {
          await execAsync(`ffmpeg -i "${getPath("webp")}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${getPath("mp4")}"`);
          await fuqi.sendMessage(ctx.id, {
            video: fs.readFileSync(getPath("mp4")),
            caption: "✅ Berhasil dikonversi ke video!"
          }, { quoted: simpleQuoted(ctx) });
          fs.unlinkSync(getPath("mp4"));
        } else {
          await execAsync(`ffmpeg -i "${getPath("webp")}" "${getPath("png")}"`);
          await fuqi.sendMessage(ctx.id, {
            image: fs.readFileSync(getPath("png")),
            caption: "✅ Berhasil dikonversi ke gambar!"
          }, { quoted: simpleQuoted(ctx) });
          fs.unlinkSync(getPath("png"));
        }
        
        fs.unlinkSync(getPath("webp"));
      } catch (error) {
        ctx.reply(`❌ Gagal mengkonversi sticker: ${error.message}`);
      }
    }
  },
  {
    name: "fakemailinbox",
    aliases: ["fakemail-inbox", "mailinbox"],
    description: "Cek inbox fake mail",
    category: "Tools",
    example: "mail_id",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.args.length) return ctx.reply("❌ Masukkan Mail ID.\nContoh: .fakemailinbox ID_MAIL");
        
        const res = await axios.get("https://api.vreden.my.id/api/v1/tools/fakemail/inbox", {
          params: { id: ctx.query }
        });
        
        const data = res.data;
        if (!data || data.status !== true) return ctx.reply("❌ Gagal mengambil inbox.");
        
        let mails = data.result.mails;
        if (!mails || mails.length === 0) return ctx.reply("📭 Inbox kosong. Belum ada email masuk.");
        
        let text = `┏━━━〔 FAKE MAIL INBOX 〕━━━┓\n\n`;
        mails.forEach((mail, i) => {
          text += 
`📨 *Email #${i + 1}*
From: ${mail.from || "-"}
Subject: ${mail.subject || "-"}
Date: ${mail.date || "-"}

`;
        });
        text += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
        
        ctx.reply(text);
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "ssweb",
    aliases: ["screenshotweb", "webscreenshot"],
    description: "Screenshot website via API",
    category: "Tools",
    example: "url",
    execute: async (fuqi, ctx, msg) => {
      try {
        let url = ctx.query?.trim();
        if (!url) return ctx.reply("❌ Masukkan URL.\nContoh: .ssweb https://github.com");
        
        const res = await axios.get(`https://image.thum.io/get/fullpage/${url}`, {
          responseType: "arraybuffer"
        });
        
        await fuqi.sendMessage(ctx.id, {
          image: Buffer.from(res.data),
          caption: `┏━━━〔 SCREENSHOT WEB 〕━━━┓\n┃ URL: ${url}\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
          contextInfo: {
            externalAdReply: {
              title: "Screenshot Web",
              body: url,
              mediaType: 1,
              thumbnailUrl: global.bot?.media?.icon1 || "",
              sourceUrl: url,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Gagal screenshot website: ${error.message}`);
      }
    }
  },
  {
    name: "subdomainfinder",
    aliases: ["subdomain", "findsubdomain"],
    description: "Cari subdomain via crt.sh",
    category: "Tools",
    example: "domain.com",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.args.length) return ctx.reply("❌ Masukkan domain.\nContoh: .subdomainfinder example.com");
        
        const res = await axios.get(`https://crt.sh/?q=%25.${ctx.query.toLowerCase()}&output=json`);
        
        if (!Array.isArray(res.data)) return ctx.reply("❌ Tidak ada hasil.");
        
        let domain = ctx.query.toLowerCase();
        let subdomains = [...new Set(
          res.data
            .flatMap(v => (v.name_value || "").split("\n"))
            .map(v => v.replace(/^\*\./, "").trim())
            .filter(v => v.endsWith(domain))
        )];
        
        if (!subdomains.length) return ctx.reply("❌ Subdomain tidak ditemukan.");
        
        let limited = subdomains.slice(0, 30);
        
        const teks = 
`┏━━━〔 SUBDOMAIN FINDER 〕━━━┓
┃ 🌐 Domain: ${domain}
┃ 📊 Total: ${subdomains.length}
┃ 📌 Ditampilkan: ${limited.length}
┃
${limited.map((v, i) => `┃ ${i + 1}. ${v}`).join("\n")}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

        ctx.reply(teks);
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil data: ${error.message}`);
      }
    }
  },
  {
    name: "webscrape",
    aliases: ["scrapeweb", "webscraping"],
    description: "Scrape konten dari URL",
    category: "Tools",
    example: "url [--text]",
    execute: async (fuqi, ctx, msg) => {
      try {
        const args = ctx.query.trim().split(" ");
        const url = args.find(v => v.startsWith("http"));
        
        if (!url) return ctx.reply("❌ URL tidak ditemukan.");
        
        const api = new URL("https://api.api-ninjas.com/v1/webscraper");
        api.searchParams.append("url", url);
        
        if (args.includes("--text") || args.includes("-t")) {
          api.searchParams.append("text_only", "true");
        }
        
        await ctx.reply("🕵️ Lagi ngintip web...");
        
        const res = await fetch(api, {
          headers: { "X-Api-Key": "S8bcSHT0z15lVc1OGljv9ssbcouQE163Io6fkCDu" }
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const content = data.data?.substring(0, 3500) || "😕 Tidak ada konten";
        const note = content.length > 3500 ? "\n\n📌 *Kepotong ya, kebanyakan konten*" : "";
        
        await fuqi.sendMessage(ctx.id, {
          text: `┏━━━〔 WEB SCRAPE 〕━━━┓\n┃\n${content}${note}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
          contextInfo: {
            externalAdReply: {
              title: "Web Scrape",
              body: url,
              mediaType: 1,
              thumbnailUrl: global.bot?.media?.icon1 || "",
              sourceUrl: url,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`💥 Error: ${error.message}`);
      }
    }
  }
];