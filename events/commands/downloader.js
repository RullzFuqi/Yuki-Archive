import axios from "axios";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { contactQuoted, simpleQuoted } from '#library/fakeQuoted';

const execAsync = promisify(exec);

function extractYoutubeId(input) {
  const match = input.match(/(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([\w-]{6,})/);
  return match ? `https://www.youtube.com/watch?v=${match[2]}` : input;
}

async function pollYoutubeFile(apiUrl) {
  const apiBase = "https://youtubedl.siputzx.my.id";

  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 2000));

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const fileUrlPath = data.fileUrl || data.file_url;
      
      if (!fileUrlPath?.trim()) continue;

      const fullFileUrl = fileUrlPath.startsWith("http") ? fileUrlPath : `${apiBase}${fileUrlPath}`;
      const fileCheck = await fetch(fullFileUrl, { method: "HEAD" });
      
      if (fileCheck.status === 200) return { ...data, fileUrl: fullFileUrl };
    } catch {}
  }

  throw new Error("File timeout");
}

async function downloadToBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export default [
  {
    name: "fbdl",
    aliases: ["fb", "facebook", "facebookdownloader"],
    description: "Download video dari Facebook",
    category: "Downloader",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan link Facebook.");
      
      try {
        const url = ctx.args[0];
        const res = await axios.get(
          `https://api.termai.cc/api/downloader/facebook?url=${encodeURIComponent(url)}&key=${global.bot.key.termai_api}`,
        );
        
        if (res.data.status !== true) {
          return ctx.reply(`❌ Gagal mengunduh: ${res.data.message || "Tidak ada respons dari server."}`);
        }
        
        await fuqi.sendMessage(
          ctx.id,
          { 
            video: { url: res.data.urls.sd }, 
            caption: res.data.title,
            contextInfo: {
              externalAdReply: {
                title: "Facebook Downloader",
                body: res.data.title || "Video Facebook",
                mediaType: 1,
                thumbnailUrl: res.data.thumbnail || global.bot.media.icon1,
                sourceUrl: url,
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "igdl",
    aliases: ["ig", "instagram", "instagramdownloader"],
    description: "Download media dari Instagram",
    category: "Downloader",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan link Instagram.");
      
      try {
        const res = await axios.get(
          `https://api.termai.cc/api/downloader/instagram?url=${encodeURIComponent(ctx.args[0])}&key=${global.bot.key.termai_api}`
        );
        
        const igdl = res.data;
        
        if (igdl.data.content.type === "video") {
          await fuqi.sendMessage(
            ctx.id,
            {
              video: { url: igdl.data.content.url },
              caption: igdl.data.title,
              contextInfo: {
                externalAdReply: {
                  title: "Instagram Downloader",
                  body: "Video Instagram",
                  mediaType: 1,
                  thumbnailUrl: igdl.data.content.thumbnail,
                  sourceUrl: igdl.data.postUrl,
                  renderLargerThumbnail: true
                }
              }
            },
            { quoted: simpleQuoted(ctx) }
          );
        } else if (igdl.data.content.type === "image") {
          await fuqi.sendMessage(
            ctx.id,
            {
              image: { url: igdl.data.content.url },
              caption: igdl.data.title,
              contextInfo: {
                externalAdReply: {
                  title: "Instagram Downloader",
                  body: "Foto Instagram",
                  mediaType: 1,
                  thumbnailUrl: igdl.data.content.thumbnail,
                  sourceUrl: igdl.data.postUrl,
                  renderLargerThumbnail: true
                }
              }
            },
            { quoted: simpleQuoted(ctx) }
          );
        }
      } catch (error) {
        ctx.reply(`❌ Error: ${error.message}`);
      }
    }
  },
  {
    name: "mediafire",
    aliases: ["mf", "mediafiredl", "mfdown"],
    description: "Download file dari MediaFire",
    category: "Downloader",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan link MediaFire.");
      
      try {
        const { default: mediafireDl } = await import("#library/mediafire");
        const result = await mediafireDl(ctx.args[0]);
        
        await fuqi.sendMessage(
          ctx.id,
          {
            document: { url: result.downloadUrl },
            fileName: result.filename,
            mimetype: "application/octet-stream",
            caption: `⬢ *MediaFire Downloader*\n\n⟡ File: ${result.filename}\n⟡ Size: ${result.filesize}`,
            contextInfo: {
              externalAdReply: {
                title: "MediaFire Downloader",
                body: result.filename,
                mediaType: 1,
                thumbnailUrl: global.bot.media.icon1,
                sourceUrl: ctx.args[0],
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal mengambil file MediaFire: ${error.message}`);
      }
    }
  },
  {
    name: "tiktok",
    aliases: ["tt", "ttdl", "tiktokdl"],
    description: "Download video dari TikTok tanpa watermark",
    category: "Downloader",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan link TikTok.");
      
      try {
        const url = ctx.args[0];
        if (!/(tiktok\.com|vt\.tiktok\.com)/i.test(url)) {
          return ctx.reply("❌ Link TikTok tidak valid.");
        }
        
        const res = await axios.post(
          "https://tikwm.com/api/",
          { url: url, hd: 1 },
          { headers: { "content-type": "application/json" } }
        );
        
        const data = res.data?.data;
        if (!data) return ctx.reply("❌ Gagal mengambil data TikTok.");
        
        await fuqi.sendMessage(
          ctx.id,
          {
            video: { url: data.hdplay || data.play },
            caption: `⬣ *TIKTOK DOWNLOADER*\n\n🎬 Judul: ${data.title || "-"}\n👤 Author: ${data.author?.unique_id || "-"}\n❤️ Likes: ${data.digg_count || 0}\n💬 Comments: ${data.comment_count || 0}\n🔗 Link: ${url}`,
            contextInfo: {
              externalAdReply: {
                title: "TikTok Downloader",
                body: data.title || "Video TikTok",
                mediaType: 1,
                thumbnailUrl: data.cover || global.bot.media.icon1,
                sourceUrl: url,
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
        
        await fuqi.sendMessage(
          ctx.id,
          {
            audio: { url: data.music },
            mimetype: "audio/mpeg",
            fileName: "tiktok_audio.mp3",
            contextInfo: {
              externalAdReply: {
                title: "TikTok Audio",
                body: data.title || "Audio TikTok",
                mediaType: 1,
                thumbnailUrl: data.cover || global.bot.media.icon1,
                sourceUrl: url,
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
      } catch (error) {
        ctx.reply(`❌ Gagal download TikTok: ${error.message}`);
      }
    }
  },
  {
    name: "ytmp3",
    aliases: ["ytm3", "ytaudio"],
    description: "Download audio dari YouTube (MP3)",
    category: "Downloader",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan link YouTube.");
      
      const isVoice = ctx.args[0]?.toLowerCase() === "voice";
      const urlIndex = isVoice ? 1 : 0;
      const ytUrl = extractYoutubeId(ctx.args[urlIndex] || "");

      if (!ytUrl.includes("youtube.com/watch?v=")) {
        return ctx.reply("❌ Link YouTube tidak valid.");
      }

      let statusMsg = null;
      const updateStatus = async (text) => {
        if (!statusMsg) {
          statusMsg = await ctx.reply(text);
        } else {
          await fuqi.sendMessage(ctx.id, { text, edit: statusMsg.key });
        }
      };

      try {
        await updateStatus("⏳ Memulai download audio...");
        
        const result = await pollYoutubeFile(
          `https://youtubedl.siputzx.my.id/download?type=audio&url=${encodeURIComponent(ytUrl)}`
        );
        
        await updateStatus("⬇️ Mendownload file...");
        const mp3Buffer = await downloadToBuffer(result.fileUrl);

        const time = Date.now();
        const tmpDir = "./tmp/audio";
        fs.mkdirSync(tmpDir, { recursive: true });

        const mp3Path = path.join(tmpDir, `${time}.mp3`);
        fs.writeFileSync(mp3Path, mp3Buffer);

        if (isVoice) {
          await updateStatus("🔄 Mengkonversi ke voice...");
          const oggPath = path.join(tmpDir, `${time}.ogg`);
          
          await execAsync(`ffmpeg -i "${mp3Path}" -avoid_negative_ts make_zero -ac 1 -c:a libopus "${oggPath}"`);

          const oggBuffer = fs.readFileSync(oggPath);
          await fuqi.sendMessage(
            ctx.id,
            {
              audio: oggBuffer,
              mimetype: "audio/ogg; codecs=opus",
              ptt: true,
              contextInfo: {
                externalAdReply: {
                  title: "YouTube Audio",
                  body: "Voice Note",
                  mediaType: 1,
                  thumbnailUrl: global.bot.media.icon1,
                  sourceUrl: ytUrl,
                  renderLargerThumbnail: true
                }
              }
            },
            { quoted: simpleQuoted(ctx) }
          );
          fs.unlinkSync(oggPath);
        } else {
          await fuqi.sendMessage(
            ctx.id,
            {
              document: mp3Buffer,
              mimetype: "audio/mpeg",
              fileName: `YT_Audio_${time}.mp3`,
              caption: `⬣ *YouTube Audio Downloader*\n\n🎵 Audio: ${result.title || "YouTube Audio"}\n🔗 Link: ${ytUrl}`,
              contextInfo: {
                externalAdReply: {
                  title: "YouTube Audio",
                  body: result.title || "Audio YouTube",
                  mediaType: 1,
                  thumbnailUrl: result.thumbnail || global.bot.media.icon1,
                  sourceUrl: ytUrl,
                  renderLargerThumbnail: true
                }
              }
            },
            { quoted: simpleQuoted(ctx) }
          );
        }

        await updateStatus("✅ Audio berhasil dikirim!");
        fs.unlinkSync(mp3Path);
      } catch (error) {
        await updateStatus(`❌ Gagal: ${error.message}`);
      }
    }
  },
  {
    name: "ytmp4",
    aliases: ["ytm4", "ytvideo"],
    description: "Download video dari YouTube (MP4)",
    category: "Downloader",
    execute: async (fuqi, ctx, msg) => {
      if (!ctx.args.length) return ctx.reply("❌ Masukkan link YouTube.");
      
      const ytUrl = extractYoutubeId(ctx.args[0]);

      if (!ytUrl.includes("youtube.com/")) {
        return ctx.reply("❌ Link YouTube tidak valid.");
      }

      let statusMsg = null;
      const updateStatus = async (text) => {
        if (!statusMsg) {
          statusMsg = await ctx.reply(text);
        } else {
          await fuqi.sendMessage(ctx.id, { text, edit: statusMsg.key });
        }
      };
      
      let mp4Path = null;
      
      try {
        await updateStatus("⏳ Memulai download video...");
        
        const apiBase = "https://youtubedl.siputzx.my.id";
        const apiUrl = `${apiBase}/download?type=merge&url=${encodeURIComponent(ytUrl)}`;
        
        await updateStatus("📥 Menunggu file video...");
        const result = await pollYoutubeFile(apiUrl);
        
        await updateStatus("⬇️ Mendownload video...");
        const mp4Buffer = await downloadToBuffer(result.fileUrl);
        
        const tmpDir = "./tmp/video";
        fs.mkdirSync(tmpDir, { recursive: true });
        
        const time = Date.now();
        mp4Path = path.join(tmpDir, `video_${time}.mp4`);
        fs.writeFileSync(mp4Path, mp4Buffer);
        
        await fuqi.sendMessage(
          ctx.id,
          {
            video: mp4Buffer,
            mimetype: "video/mp4",
            caption: `⬣ *YouTube Video Downloader*\n\n🎬 Video: ${result.title || "YouTube Video"}\n🔗 Link: ${ytUrl}`,
            contextInfo: {
              externalAdReply: {
                title: "YouTube Video",
                body: result.title || "Video YouTube",
                mediaType: 1,
                thumbnailUrl: result.thumbnail || global.bot.media.icon1,
                sourceUrl: ytUrl,
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: simpleQuoted(ctx) }
        );
        
        await updateStatus("✅ Video berhasil dikirim!");
      } catch (error) {
        await updateStatus(`❌ Gagal: ${error.message}`);
      } finally {
        if (mp4Path && fs.existsSync(mp4Path)) {
          fs.unlinkSync(mp4Path);
        }
      }
    }
  }
];