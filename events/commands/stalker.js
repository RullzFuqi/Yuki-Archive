import axios from "axios";
import { simpleQuoted } from '#library/fakeQuoted';

export default [
  {
    name: "ytstalk",
    aliases: ["youtubestalk", "stalkyt"],
    description: "Menampilkan informasi channel YouTube",
    category: "Stalker",
    example: "username",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.args.length) return ctx.reply("❌ Masukkan username YouTube.\nContoh: .ytstalk mrbeast");
        
        const username = ctx.args[0].replace("@", "");
        const { data } = await axios.get(`https://api.deltaku.web.id/api/stalk/youtube?username=${username}`);
        
        if (!data.status) return ctx.reply("❌ Channel tidak ditemukan");
        
        const d = data.data;
        const latest = d.latest_videos?.slice(0, 3).map(v => 
          `• ${v.title}\n  ⏱️ ${v.duration} | 👁️ ${v.viewCount} | 🗓️ ${v.publishedTime}`
        ).join("\n\n");
        
        const teks = 
`┏━━━〔 YOUTUBE STALKER 〕━━━┓
┃ Channel: ${d.channel.username}
┃ Name: ${d.channel.title || "Unknown"}
┃ Subscribers: ${d.channel.subscriberCount || "0"}
┃ Videos: ${d.channel.videoCount || "0"}
┃ Description: ${d.channel.description?.slice(0, 200) || "-"}...
┃
┃ 📹 Latest Videos:
${latest || "• No videos"}
┃
┃ 🔗 ${d.channel.channelUrl}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

        await fuqi.sendMessage(ctx.id, {
          image: { url: d.channel.avatarUrl },
          caption: teks,
          contextInfo: {
            externalAdReply: {
              title: d.channel.title || "YouTube Channel",
              body: `${d.channel.subscriberCount || "0"} • ${d.channel.videoCount || "0"} videos`,
              mediaType: 1,
              thumbnailUrl: d.channel.avatarUrl,
              sourceUrl: d.channel.channelUrl,
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
    name: "ttstalk",
    aliases: ["tiktokstalk", "stalktt"],
    description: "Menampilkan informasi profil TikTok",
    category: "Stalker",
    example: "username",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.args.length) return ctx.reply("❌ Masukkan username TikTok.\nContoh: .ttstalk rullzcode01");
        
        const username = ctx.args[0].replace("@", "");
        const { data } = await axios.get(`https://api.deltaku.web.id/api/stalk/tiktok?username=${username}`);
        
        if (!data.status) return ctx.reply("❌ Akun tidak ditemukan");
        
        const d = data.data.user;
        const stats = data.data.statistics;
        
        const teks = 
`┏━━━〔 TIKTOK STALKER 〕━━━┓
┃ Username: @${d.unique_id}
┃ Nickname: ${d.nickname}
┃ ID: ${d.id}
┃ Verified: ${d.verified ? "✅" : "❌"}
┃ Private: ${d.private_account ? "🔒" : "🌍"}
┃
┃ 📊 Statistics:
┃ • Followers: ${stats.followers?.toLocaleString() || 0}
┃ • Following: ${stats.following || 0}
┃ • Hearts: ${stats.hearts?.toLocaleString() || 0}
┃ • Videos: ${stats.videos || 0}
┃
┃ 📝 Bio: ${d.signature || "-"}
┃
┃ 🔗 ${data.data.profile_url}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

        await fuqi.sendMessage(ctx.id, {
          image: { url: d.avatar },
          caption: teks,
          contextInfo: {
            externalAdReply: {
              title: d.nickname,
              body: `@${d.unique_id} • ${stats.followers?.toLocaleString() || 0} followers`,
              mediaType: 1,
              thumbnailUrl: d.avatar,
              sourceUrl: data.data.profile_url,
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
    name: "robloxstalk",
    aliases: ["rblxstalk", "stalkroblox"],
    description: "Menampilkan informasi profil Roblox",
    category: "Stalker",
    example: "username",
    execute: async (fuqi, ctx, msg) => {
      try {
        if (!ctx.args.length) return ctx.reply("❌ Masukkan username Roblox.\nContoh: .robloxstalk aouaaaypsa");
        
        const username = ctx.query;
        const { data } = await axios.get(`https://api.deltaku.web.id/api/stalk/roblox?q=${encodeURIComponent(username)}`);
        
        if (!data.status) return ctx.reply("❌ User tidak ditemukan");
        
        const d = data.data;
        const basic = d.basic_info;
        
        const teks = 
`┏━━━〔 ROBLOX STALKER 〕━━━┓
┃ Username: ${basic.username}
┃ Display Name: ${basic.display_name}
┃ User ID: ${basic.user_id}
┃ Created: ${basic.created_formatted}
┃ Verified Badge: ${basic.has_verified_badge ? "✅" : "❌"}
┃ Banned: ${basic.is_banned ? "🚫" : "✅"}
┃
┃ 📊 Stats:
┃ • Friends: ${d.friends?.count || 0}
┃ • Followers: ${d.followers?.count || 0}
┃ • Following: ${d.following?.count || 0}
┃ • Groups: ${d.groups?.count || 0}
┃ • Badges: ${d.badges?.count || 0}
┃ • Games: ${d.games?.count || 0}
┃
┃ 📝 Bio: ${basic.description || "-"}
┃
┃ 🔗 ${basic.profile_url}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

        await fuqi.sendMessage(ctx.id, {
          image: { url: d.avatar?.image_url },
          caption: teks,
          contextInfo: {
            externalAdReply: {
              title: basic.display_name || basic.username,
              body: `Friends: ${d.friends?.count || 0} • Groups: ${d.groups?.count || 0}`,
              mediaType: 1,
              thumbnailUrl: d.avatar?.image_url,
              sourceUrl: basic.profile_url,
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