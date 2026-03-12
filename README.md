<h1 align="center">✨ YUKI - ARCHIVE ✨</h1>

<p align="center">
  <img src="https://media1.tenor.com/m/sgiUtMMfg3oAAAAd/roshidere-alya-sometimes-hides-her-feelings-in-russian.gif" alt="Yuki Banner" width="480"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D21.0.0-brightgreen?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/baileys-latest-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/version-1.2.0-orange?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/RullzFuqi/Yuki-Archive?style=for-the-badge&logo=github" />
  <img src="https://img.shields.io/github/forks/RullzFuqi/Yuki-Archive?style=for-the-badge&logo=github" />
</p>

---

## 📖 Tentang Yuki Archive

**Yuki Archive** adalah bot WhatsApp modern berbasis **Baileys** yang hadir dengan performa stabil, fitur yang kaya, dan arsitektur plugin yang terstruktur rapi. Diciptakan untuk menemani aktivitasmu — dari sekadar hiburan ringan, manajemen grup, hingga petualangan seru di dunia RPG.

---

## ✨ Keunggulan

- ⚡ **Cepat & Stabil** — Dibangun di atas Baileys versi terbaru dengan koneksi yang ringan dan responsif.
- 🧩 **Plugin Manager Rapi** — Sistem pemuatan command yang modular, mendukung hot-reload dan pemindaian plugin otomatis.
- 🎮 **RPG Seru & Lengkap** — Nikmati sistem level, inventory, cooldown, dan database terintegrasi langsung di WhatsApp.
- 📦 **Banyak Kategori** — Dari downloader, tools, maker, hingga stalker dan RPG — semua ada di sini.
- 🔒 **Session Aman** — Autentikasi multi-file yang menjaga sesi tetap tersimpan dan terlindungi.
- 🖼️ **Dukungan Media Lengkap** — Kirim gambar, video, audio, dokumen, sticker, hingga pesan interaktif.
- 🧠 **Auto Leveling** — Sistem EXP dan naik level otomatis buat pengguna RPG yang aktif.
- 📱 **Fleksibel** — Bisa jalan di Termux (Android) maupun VPS (Linux) tanpa ribet.

---

## 📦 Kategori Fitur

| Kategori | Deskripsi |
| :--- | :--- |
| 📂 **General** | Menu utama, info bot, ping, dan registrasi RPG |
| 📥 **Downloader** | Unduh media dari berbagai platform populer |
| 🧰 **Tools** | Kumpulan alat bantu yang berguna sehari-hari |
| 🎨 **Maker** | Bikin stiker, gambar, dan berbagai efek kreatif |
| 👑 **Owner** | Panel khusus untuk pemilik bot |
| 🧩 **Random** | Fitur hiburan dan konten acak yang seru |
| 🔎 **Search** | Cari informasi apa saja dengan cepat |
| 🕵️ **Stalker** | Cek profil dan info publik akun sosial media |
| 🔮 **RPG** | Game RPG lengkap dengan inventory, level, dan petualangan |

> 💡 Ketik `.menu` atau `.allmenu` setelah bot aktif untuk melihat semua perintah yang tersedia.

---

## 🛠️ Kebutuhan Sistem

- **Node.js** v21 atau lebih baru
- **FFmpeg** — untuk fitur media dan sticker

---

## 🚀 Panduan Instalasi

### 📱 Termux (Android)

```bash
# 1. Update paket
pkg update && pkg upgrade -y

# 2. Install FFmpeg
pkg install ffmpeg -y

# 3. Clone repository
git clone https://github.com/RullzFuqi/Yuki-Archive.git
cd Yuki-Archive

# 4. Install dependensi
npm install

# 5. Jalankan bot
npm start
```

> Saat pertama kali dijalankan, pilih metode koneksi: **Pairing Code** atau **QR Code**.
> - Pairing: masukkan nomor WhatsApp aktifmu.
> - QR: scan QR yang muncul di terminal.

---

### 🖥️ VPS (Ubuntu / Debian)

```bash
# 1. Update sistem & install FFmpeg
sudo apt update && sudo apt upgrade -y
sudo apt install ffmpeg -y

# 2. Install Node.js v21
curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash -
sudo apt install nodejs -y

# 3. Clone repository
git clone https://github.com/RullzFuqi/Yuki-Archive.git
cd Yuki-Archive

# 4. Install dependensi
npm install

# 5. Jalankan dengan PM2 (agar tetap hidup)
npm install -g pm2
pm2 start connect.js --name "yuki-bot"
pm2 save
pm2 startup

# Lihat log bot
pm2 logs yuki-bot
```

---

## 📁 Struktur Direktori

```
Yuki-Archive/
├── events/          # Pusat logika bot (command, config, helper)
│   └── commands/    # Folder berisi semua kategori perintah bot
├── library/         # Tempat menyimpan file pendukung & database bot
│   └── database/    # Penyimpanan data pengguna & RPG secara lokal
├── utils/           # Utilitas umum yang dipakai oleh berbagai modul
└── ...              # File utama bot (connect, handler, package)
```

---

## ⚙️ Konfigurasi

Atur semua pengaturan bot di file `events/config.js`:

- `global.bot.name` — Nama bot yang tampil ke pengguna
- `global.bot.media` — URL banner atau ikon bot
- `global.bot.utils` — Link newsletter dan informasi tambahan

> Data pengguna & RPG tersimpan otomatis di `library/database/database.json`.

---

## 📌 Catatan Penting

- 🗂️ Jangan hapus folder `./session` — itu tempat sesi login tersimpan.
- ⛔ Untuk menghentikan bot di Termux: `Ctrl + C`
- 🔄 Restart bot di PM2: `pm2 restart yuki-bot`
- 🛠️ Jika ada error modul: hapus `node_modules` dan `package-lock.json`, lalu jalankan `npm install` ulang.

---

## 🆘 Bantuan & Kontribusi

Menemukan bug atau punya ide fitur baru? Jangan ragu buat buka **issue** atau kirim **pull request** di GitHub!

- 📬 **Kontak:** [Telegram](https://t.me/)
- 🌐 **Website:** [rullzfuqione.xyz](https://rullzfuqione.xyz)

---

<p align="center">
  <b>© 2025 RullzFuqi. All rights reserved.</b><br>
  <i>Made with ❤️ and JavaScript</i>
</p>
