import axios from "axios";
import Jimp from "jimp";
export const delay = (ms) => new Promise((r) => setTimeout(r, ms));
export const rand = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
export const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const isUrl = (s) =>
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/.test(
    s,
  );
export const slugify = (s) =>
  String(s).toLowerCase().replace(/\s+/g, "").replace(/[^\w]/g, "");
export const formatNum = (n) => Number(n).toLocaleString("id-ID");
export const runtime = (s) => {
  s = Math.floor(Number(s));
  const d = Math.floor(s / 86400),
    h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60),
    sc = s % 60;
  return [d && d + "d", h && h + "h", m && m + "m", sc + "s"]
    .filter(Boolean)
    .join(" ");
};
export const formatDur = (ms) => {
  const s = Math.floor(ms / 1000);
  if (s < 60) return s + " detik";
  if (s < 3600) return Math.floor(s / 60) + " menit " + (s % 60) + " detik";
  if (s < 86400)
    return (
      Math.floor(s / 3600) + " jam " + Math.floor((s % 3600) / 60) + " menit"
    );
  return (
    Math.floor(s / 86400) + " hari " + Math.floor((s % 86400) / 3600) + " jam"
  );
};
export const ucapan = () => {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return "Selamat Pagi ☀️";
  if (h >= 11 && h < 15) return "Selamat Siang 🌤️";
  if (h >= 15 && h < 18) return "Selamat Sore 🌅";
  return "Selamat Malam 🌙";
};
export const progressBar = (val, max, len = 10) => {
  const p = Math.min(
    len,
    Math.floor((Math.min(val, max) / Math.max(max, 1)) * len),
  );
  return "█".repeat(p) + "░".repeat(len - p);
};
export const getBuffer = async (url, opts = {}) => {
  const r = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 15000,
    ...opts,
  });
  return Buffer.from(r.data);
};

export const imgResize = async (buff, width, height) => {
  if (typeof buff === "string") buff = await getBuffer(buff);
  const image = await Jimp.read(buff);
  image.resize(width, height);
  return await image.getBufferAsync(image.getMIME());
};
