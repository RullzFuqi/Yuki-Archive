import axios from "axios";
import * as cheerio from "cheerio";
import yts from "yt-search";
import { Buffer } from "buffer";
import { contactQuoted, simpleQuoted } from '#library/fakeQuoted';

function convertMs(ms) {
  const m = Math.floor(ms / 60000);
  const s = ((ms % 60000) / 1000).toFixed(0);
  return m + ":" + (Number(s) < 10 ? "0" : "") + s;
}

async function spotifyTokenGen(client) {
  return axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(client).toString("base64")
      },
      timeout: 30000
    }
  ).then(r => ({
    status: true,
    token: r.data.access_token
  })).catch(() => ({ status: false }));
}

async function getSpotifyToken() {
  let t1 = await spotifyTokenGen("7bbae52593da45c69a27c853cc22edff:88ae1f7587384f3f83f62a279e7f87af");
  if (t1.status) return t1.token;
  let t2 = await spotifyTokenGen("f97b33bf590840f7ab31e7d372b1a1bf:d700cceafc7c4de483b2ec3850f97a6a");
  if (t2.status) return t2.token;
  return null;
}

export default [
  {
    name: "sticker-search",
    aliases: ["stickersearch", "ssearch", "combotstickers"],
    description: "Mencari sticker dari combot",
    category: "Search",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan keyword sticker");
      
      try {
        const res = await axios.post("https://api.siputzx.my.id/api/sticker/combot-search", {
          q: ctx.query,
          page: 1
        }, {
          headers: { "Content-Type": "application/json" }
        });
        
        const data = res.data.data.results;
        if (!data || !data.length) return ctx.reply("❌ Sticker tidak ditemukan");
        
        const pack = data[Math.floor(Math.random() * data.length)];
        const list = pack.sticker_urls.sort(() => 0.5 - Math.random()).slice(0, 5);
        const album = list.map((u, i) => ({
          image: { url: u },
          caption: `[ ${pack.title} ]\nSticker ${i + 1}`
        }));
        
        await fuqi.sendMessage(
          ctx.id,
          { album },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil sticker: ${error.message}`);
      }
    }
  },
  {
    name: "githubsearch",
    aliases: ["ghsearch", "github"],
    description: "Mencari repository di GitHub",
    category: "Search",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan nama repository.\nContoh: .githubsearch baileys");
      
      try {
        const res = await axios.get(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(ctx.query)}&per_page=5`
        );
        
        const list = res.data.items;
        if (!list?.length) return ctx.reply(`❌ Tidak ditemukan hasil untuk: ${ctx.query}`);
        
        const teks = [
          "┏━━━〔 GITHUB SEARCH 〕━━━┓",
          ...list.map((r, i) => 
            `${i + 1}. ${r.full_name}\n   ⭐ Stars : ${r.stargazers_count}\n   🍴 Forks : ${r.forks_count}\n   📝 Info  : ${r.description || "Tanpa deskripsi"}\n   🔗 Link  : ${r.html_url}`
          ),
          "┗━━━━━━━━━━━━━━━━━━━━┛"
        ].join("\n\n");
        
        await ctx.reply(teks);
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "komikusearch",
    aliases: ["komiku", "mangasearch"],
    description: "Mencari manga di Komiku",
    category: "Search",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan judul manga");
      
      try {
        if (ctx.args[0].toLowerCase() === "detail") {
          const q = ctx.args.slice(1).join(" ").trim();
          const url = q.startsWith("http") ? q : "https://komiku.org/manga/" + q.replace(/\s+/g, "-").toLowerCase() + "/";
          
          const res = await axios.get(url);
          const $ = cheerio.load(res.data);
          
          const title = $("#Judul h1 span").text().trim();
          const indo = $("#Judul .j2").text().trim();
          const desk = $(".desc").text().trim().slice(0, 600);
          const img = $(".ims img").attr("src");
          
          const info = {};
          $(".inftable tr").each((i, e) => {
            const k = $(e).find("td").eq(0).text().trim();
            const v = $(e).find("td").eq(1).text().trim();
            if (k) info[k] = v;
          });
          
          const genre = $(".genre span").map((i, e) => $(e).text()).get().join(", ");
          
          const teks = 
`┏━━━〔 DETAIL MANGA 〕━━━┓
┃ Judul : ${title}
┃ Indo  : ${indo}
┃ Jenis : ${info["Jenis Komik"] || "-"}
┃ Konsep: ${info["Konsep Cerita"] || "-"}
┃ Author: ${info["Pengarang"] || "-"}
┃ Status: ${info["Status"] || "-"}
┃ Umur  : ${info["Umur Pembaca"] || "-"}
┃ Genre : ${genre}
┗━━━━━━━━━━━━━━━━━━━━┛

Sinopsis:
${desk}...

🔗 Link → ${url}`;
          
          await fuqi.sendMessage(ctx.id, {
            image: { url: img },
            caption: teks,
            contextInfo: {
              externalAdReply: {
                title: "Komiku Search",
                body: title,
                mediaType: 1,
                thumbnailUrl: img,
                sourceUrl: url,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: simpleQuoted(ctx) });
        } else {
          const res = await axios.get("https://api.komiku.id/", {
            params: { post_type: "manga", s: ctx.query }
          });
          
          const $ = cheerio.load(res.data);
          const el = $(".bge").first();
          if (!el.length) return ctx.reply("❌ Manga tidak ditemukan");
          
          const title = el.find("h3").text().trim();
          const link = "https://komiku.org" + el.find("a").attr("href");
          const img = el.find("img").attr("src");
          const type = el.find(".tpe1_inf").text().trim();
          const update = el.find(".kan p").text().trim();
          const awal = el.find(".new1").eq(0).text().replace(/\s+/g, " ").trim();
          const latest = el.find(".new1").eq(1).text().replace(/\s+/g, " ").trim();
          
          const teks = 
`┏━━━〔 KOMIKU SEARCH 〕━━━┓
┃ Judul   : ${title}
┃ Tipe    : ${type}
┃ Update  : ${update}
┃ Awal    : ${awal}
┃ Terbaru : ${latest}
┗━━━━━━━━━━━━━━━━━━━━┛
🔍 Detail → .komikusearch detail ${link}`;
          
          await fuqi.sendMessage(ctx.id, {
            image: { url: img },
            caption: teks,
            contextInfo: {
              externalAdReply: {
                title: "Komiku Search",
                body: title,
                mediaType: 1,
                thumbnailUrl: img,
                sourceUrl: link,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: simpleQuoted(ctx) });
        }
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil data: ${error.message}`);
      }
    }
  },
  {
    name: "npms",
    aliases: ["searchnpm", "npmpkg"],
    description: "Mencari package di NPM",
    category: "Search",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan nama package.\nContoh: .npms baileys");
      
      try {
        const res = await axios.get(
          `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(ctx.query)}&size=5`
        );
        
        const list = res.data.objects;
        if (!list?.length) return ctx.reply(`❌ Tidak ditemukan hasil untuk: ${ctx.query}`);
        
        const teks = [
          "┏━━━〔 NPM SEARCH 〕━━━┓",
          ...list.map((v, i) => {
            const p = v.package;
            return `${i + 1}. ${p.name}\n   📦 Version : ${p.version}\n   📝 Info    : ${p.description || "Tanpa deskripsi"}\n   🔗 Link    : ${p.links.npm}`;
          }),
          "┗━━━━━━━━━━━━━━━━━━━━┛"
        ].join("\n\n");
        
        await ctx.reply(teks);
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "otakudesu",
    aliases: ["otakudesu-search", "otakudesus"],
    description: "Mencari anime di Otakudesu",
    category: "Search",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan judul anime");
      
      try {
        const { data } = await axios.get(
          `https://api.nekolabs.web.id/discovery/otakudesu/search?q=${encodeURIComponent(ctx.query)}`
        );
        
        if (!data.success || !data.result.length) {
          return ctx.reply("❌ Anime tidak ditemukan.");
        }
        
        const a = data.result[0];
        
        await fuqi.sendMessage(ctx.id, {
          image: { url: a.cover },
          caption: 
`┏━━━〔 ANIME DETAIL 〕━━━┓
┃ Title   : ${a.title}
┃ Rating  : ${a.rating}
┃ Status  : ${a.status}
┃ Genre   : ${a.genres.join(", ")}
┗━━━━━━━━━━━━━━━━━━━━┛

┏━━━〔 SOURCE 〕━━━┓
┃ ${a.url}
┗━━━━━━━━━━━━━━━━━━━━┛`,
          contextInfo: {
            externalAdReply: {
              title: "Otakudesu Search",
              body: a.title,
              mediaType: 1,
              thumbnailUrl: a.cover,
              sourceUrl: a.url,
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
    name: "pinterest",
    aliases: ["pin", "pins", "pinterestsearch"],
    description: "Mencari gambar di Pinterest",
    category: "Search",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan query pencarian.");
      
      const hasNumber = /^\d+$/.test(ctx.args[ctx.args.length - 1]);
      const limit = hasNumber ? Math.min(parseInt(ctx.args.pop()), 10) : 5;
      const query = ctx.args.join(" ");
      
      try {
        const fetchImages = async () => {
          try {
            const r = await axios.get(
              "https://api.siputzx.my.id/api/s/pinterest?query=" + query + "&type=image"
            );
            if (!r.data?.data?.length) throw 0;
            return r.data.data.map(v => v.image_url);
          } catch {
            const r = await axios.get(
              `https://api.termai.cc/api/search/pinterest-image?query=${query}&key=${global.bot.key.termai_api || ""}`
            );
            return r.data.data;
          }
        };
        
        const images = await fetchImages();
        if (!images?.length) return ctx.reply("❌ Tidak ditemukan hasil.");
        
        images.sort(() => Math.random() - 0.5);
        
        const album = images.slice(0, limit).map((url, i) => ({
          image: { url },
          caption: `┏━━━〔 PINTEREST 〕━━━┓\n┃ Pencarian: ${query}\n┃ (${i + 1}/${limit})\n┗━━━━━━━━━━━━━━━━━━━━┛`
        }));
        
        await fuqi.sendMessage(ctx.id, { album }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "spotifysearch",
    aliases: ["spotify-search", "spsearch"],
    description: "Mencari lagu di Spotify",
    category: "Search",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan judul lagu");
      
      try {
        const token = await getSpotifyToken();
        if (!token) return ctx.reply("❌ Auth Spotify gagal");
        
        const res = await axios.get("https://api.spotify.com/v1/search", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            q: ctx.query,
            type: "track",
            limit: 5,
            market: "US"
          }
        });
        
        const items = res.data.tracks.items;
        if (!items.length) return ctx.reply("❌ Lagu tidak ditemukan");
        
        const album = items.map(v => ({
          image: { url: v.album.images[0]?.url },
          caption: 
`┏━━━〔 SPOTIFY TRACK 〕━━━┓
┃ Title : ${v.artists[0].name} - ${v.name}
┃ Artist: ${v.artists[0].name}
┃ Album : ${v.album.name}
┃ Durasi: ${convertMs(v.duration_ms)}
┃ Rilis : ${v.album.release_date}
┗━━━━━━━━━━━━━━━━━━━━┛
🔗 Link: ${v.external_urls.spotify}`
        }));
        
        await fuqi.sendMessage(ctx.id, { album }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil data Spotify: ${error.message}`);
      }
    }
  },
  {
    name: "tiktoksearch",
    aliases: ["ttsearch", "tiktok-search"],
    description: "Mencari video di TikTok",
    category: "Search",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan kata kunci pencarian");
      
      try {
        const res = await axios("https://tikwm.com/api/feed/search", {
          method: "POST",
          data: {
            keywords: ctx.query,
            count: 12,
            cursor: 0,
            web: 1,
            hd: 1
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": "current_langange=en;",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          }
        });
        
        const vids = res.data.data.videos;
        if (!vids || !vids.length) return ctx.reply("❌ Video tidak ditemukan");
        
        const v = vids[Math.floor(Math.random() * vids.length)];
        const teks = 
`┏━━━〔 TIKTOK SEARCH 〕━━━┓
┃ Judul   : ${v.title || "-"}
┃ Author  : ${v.author.nickname}
┃ Username: @${v.author.unique_id}
┃ Region  : ${v.region}
┃ Likes   : ${v.digg_count || 0}
┃ Comments: ${v.comment_count || 0}
┗━━━━━━━━━━━━━━━━━━━━┛
🎵 Audio → https://tikwm.com${v.music}`;
        
        await fuqi.sendMessage(ctx.id, {
          video: { url: "https://tikwm.com" + v.play },
          caption: teks,
          contextInfo: {
            externalAdReply: {
              title: "TikTok Search",
              body: v.title || "Video TikTok",
              mediaType: 1,
              thumbnailUrl: v.cover || global.bot?.media?.icon1,
              sourceUrl: `https://tiktok.com/@${v.author.unique_id}/video/${v.video_id}`,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil video: ${error.message}`);
      }
    }
  },
  {
    name: "ytsearch",
    aliases: ["yts", "play", "ytsearch"],
    description: "Mencari konten di YouTube",
    category: "Search",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan kata kunci.\nContoh: .yts ultraman");
      
      try {
        const data = await yts(ctx.query);
        if (!data.all || data.all.length === 0) {
          return ctx.reply(`❌ Hasil tidak ditemukan untuk "${ctx.query}"`);
        }
        
        const res = data.all[0];
        
        if (res.type === "video") {
          const caption = 
`┏━━━〔 YOUTUBE SEARCH 〕━━━┓
┃ 🎬 Judul: ${res.title}
┃ 👤 Channel: ${res.author?.name || "-"}
┃ ⏱ Durasi: ${res.timestamp || "-"}
┃ 👁 Penonton: ${res.views?.toLocaleString() || "-"}
┗━━━━━━━━━━━━━━━━━━━━┛
🔗 Link: ${res.url}`;
          
          const sections = data.all
            .filter(v => v.type === "video")
            .slice(0, 10)
            .map((v, i) => ({
              title: `#${i + 1} ${v.title}`,
              highlight_label: v.timestamp || "-",
              rows: [
                {
                  header: "YTDL",
                  title: "🎥 Download Video",
                  id: `.ytmp4 ${v.url}`,
                  description: "Kirim sebagai mp4"
                },
                {
                  header: "YTDL",
                  title: "📁 Download Audio",
                  id: `.ytmp3 ${v.url}`,
                  description: "Kirim sebagai file mp3"
                },
                {
                  header: "YTDL",
                  title: "🎙️ Voice Note",
                  id: `.ytmp3 voice ${v.url}`,
                  description: "Kirim sebagai voice note"
                }
              ]
            }));
          
          await fuqi.sendMessage(ctx.id, {
            image: { url: res.thumbnail },
            caption,
            buttons: [
              {
                buttonId: "active",
                buttonText: { displayText: "🧾 List Download" },
                type: 4,
                nativeFlowInfo: {
                  name: "single_select",
                  paramsJson: JSON.stringify({
                    title: "🧾 Pilih Video untuk Download",
                    sections
                  })
                }
              }
            ],
            headerType: 4,
            contextInfo: {
              externalAdReply: {
                title: res.title,
                body: res.author?.name || "YouTube",
                thumbnailUrl: res.thumbnail,
                sourceUrl: res.url,
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: simpleQuoted(ctx) });
        } else if (res.type === "live") {
          await ctx.reply(
`┏━━━〔 YOUTUBE LIVE 〕━━━┓
┃ 🔴 Judul: ${res.title}
┃ 👤 Channel: ${res.author?.name || "-"}
┃ 👁 Menonton: ${res.views?.toLocaleString() || "-"}
┗━━━━━━━━━━━━━━━━━━━━┛
🔗 Link: ${res.url}`
          );
        } else if (res.type === "channel") {
          await ctx.reply(
`┏━━━〔 YOUTUBE CHANNEL 〕━━━┓
┃ 📺 Nama: ${res.name}
┃ 👥 Subscriber: ${res.subCount || "-"}
┃ 🎥 Total video: ${res.videoCount || "-"}
┗━━━━━━━━━━━━━━━━━━━━┛
🔗 Link: ${res.url}`
          );
        } else if (res.type === "playlist") {
          await ctx.reply(
`┏━━━〔 YOUTUBE PLAYLIST 〕━━━┓
┃ 📂 Judul: ${res.title}
┃ 🎥 Jumlah video: ${res.videoCount || "-"}
┃ 👤 Channel: ${res.author?.name || "-"}
┗━━━━━━━━━━━━━━━━━━━━┛
🔗 Link: ${res.url}`
          );
        } else {
          await ctx.reply(
`┏━━━〔 YOUTUBE ${res.type.toUpperCase()} 〕━━━┓
┃ 📌 Judul: ${res.title || res.name || "-"}
┃ 👤 Pemilik: ${res.author?.name || "-"}
┗━━━━━━━━━━━━━━━━━━━━┛
🔗 Link: ${res.url}`
          );
        }
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "nekopoisearch",
    aliases: ["nekopoi-search", "nekopoi"],
    description: "Mencari konten di Nekopoi",
    category: "Search",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan query pencarian!\nContoh: .nekopoisearch Shoujo Ramune");
      
      try {
        const { data } = await axios.get(
          `https://api.nekolabs.web.id/discovery/nekopoi/v1/search?q=${encodeURIComponent(ctx.query)}`
        );
        
        if (!data.result || !data.result.length) return ctx.reply("❌ Hasil tidak ditemukan!");
        
        const first = data.result[0];
        
        await fuqi.sendMessage(ctx.id, {
          image: { url: first.cover },
          caption: 
`┏━━━〔 NEKOPOI SEARCH 〕━━━┓
┃ Title: ${first.title}
┃ Type: ${first.type}
┗━━━━━━━━━━━━━━━━━━━━┛
🔗 URL: ${first.url}`,
          contextInfo: {
            externalAdReply: {
              title: "Nekopoi Search",
              body: first.title,
              mediaType: 1,
              thumbnailUrl: first.cover,
              sourceUrl: first.url,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: simpleQuoted(ctx) });
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  }
];