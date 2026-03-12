import { simpleQuoted } from '#library/fakeQuoted';
import db from '#utils/database';

export function getExpNeeded(level) {
  if (level < 1) level = 1;
  if (level <= 20) {
    const table = [0,100,300,600,1000,1500,2100,2800,3600,4500,5500,6600,7800,9100,10500,12000,13600,15300,17100,19000,21000];
    return table[level];
  }
  return Math.floor(21000 + (level - 20) * 3000);
}

function getTotalExpForLevel(level) {
  let total = 0;
  for (let i = 1; i < level; i++) total += getExpNeeded(i);
  return total;
}

function checkCooldown(last, ms) {
  const now = Date.now();
  if (now - last < ms) {
    const rem = ms - (now - last);
    return { available: false, minutes: Math.floor(rem / 60000), seconds: Math.floor((rem % 60000) / 1000) };
  }
  return { available: true };
}

function roll(chance) { return Math.random() < chance; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const ITEMS = {
  general: {
    hp:      { name: 'HP',       emoji: '❤️',  category: 'general' },
    hpMax:   { name: 'HP Max',   emoji: '💗',  category: 'general' },
    mana:    { name: 'Mana',     emoji: '🔷',  category: 'general' },
    manaMax: { name: 'Mana Max', emoji: '💠',  category: 'general' },
    atk:     { name: 'ATK',      emoji: '⚔️',  category: 'general' },
    def:     { name: 'DEF',      emoji: '🛡️',  category: 'general' },
  },
  tools: {
    pickaxe_iron:    { name: 'Beliung Besi',    emoji: '⛏️',    tier: 'iron',    craft: true,  buyPrice: 800,   sellPrice: 400 },
    pickaxe_diamond: { name: 'Beliung Berlian', emoji: '💎⛏️',  tier: 'diamond', craft: true,  buyPrice: 3500,  sellPrice: 1500 },
    rod_wood:        { name: 'Pancing Kayu',    emoji: '🎣',    tier: 'wood',    craft: true,  buyPrice: 300,   sellPrice: 120 },
    rod_premium:     { name: 'Pancing Premium', emoji: '🎣✨',  tier: 'premium', craft: true,  buyPrice: 2500,  sellPrice: 1000 },
  },
  weapon: {
    sword_stone:    { name: 'Pedang Batu',      emoji: '🗡️',    tier: 'stone',     atk: 8,   craft: true,  exclusive: false, buyPrice: 500,   sellPrice: 200 },
    sword_iron:     { name: 'Pedang Besi',      emoji: '⚔️',    tier: 'iron',      atk: 18,  craft: true,  exclusive: false, buyPrice: 1500,  sellPrice: 600 },
    sword_diamond:  { name: 'Pedang Berlian',   emoji: '💎⚔️',  tier: 'diamond',   atk: 35,  craft: true,  exclusive: false, buyPrice: 5000,  sellPrice: 2000 },
    sword_light:    { name: 'Pedang Cahaya',    emoji: '🌟⚔️',  tier: 'light',     atk: 70,  craft: false, exclusive: true,  buyPrice: 0,     sellPrice: 0 },
    sword_dark:     { name: 'Pedang Kegelapan', emoji: '🌑⚔️',  tier: 'dark',      atk: 75,  craft: false, exclusive: true,  buyPrice: 0,     sellPrice: 0 },
  },
  armor: {
    armor_leather:  { name: 'Armor Kulit',    emoji: '🧥',    tier: 'leather', def: 5,   craft: true,  exclusive: false, buyPrice: 600,   sellPrice: 250 },
    armor_iron:     { name: 'Armor Besi',     emoji: '🛡️',    tier: 'iron',    def: 15,  craft: true,  exclusive: false, buyPrice: 2000,  sellPrice: 800 },
    armor_crystal:  { name: 'Armor Kristal',  emoji: '💠🛡️',  tier: 'crystal', def: 35,  craft: false, exclusive: true,  buyPrice: 0,     sellPrice: 0 },
  },
  stats: {
    level: { name: 'Level', emoji: '⭐' },
    exp:   { name: 'EXP',   emoji: '✨' },
  },
  finance: {
    money: { name: 'Money', emoji: '💰' },
    mcoin: { name: 'MCoin', emoji: '🪙' },
  },
  food: {
    bread:        { name: 'Roti',          emoji: '🍞',  heal: 30,  buyPrice: 80,   sellPrice: 40 },
    rice:         { name: 'Nasi',          emoji: '🍚',  heal: 50,  buyPrice: 120,  sellPrice: 60 },
    grilled_fish: { name: 'Ikan Bakar',    emoji: '🐟',  heal: 80,  buyPrice: 200,  sellPrice: 100 },
    steak:        { name: 'Steak',         emoji: '🥩',  heal: 130, buyPrice: 500,  sellPrice: 250 },
    fruit_salad:  { name: 'Salad Buah',    emoji: '🥗',  heal: 60,  buyPrice: 150,  sellPrice: 70 },
    roast_chicken:{ name: 'Ayam Panggang', emoji: '🍗',  heal: 110, buyPrice: 400,  sellPrice: 180 },
  },
  drink: {
    water:        { name: 'Air Putih',     emoji: '💧',  mana: 20,  buyPrice: 30,   sellPrice: 10 },
    juice:        { name: 'Jus Buah',      emoji: '🧃',  mana: 50,  buyPrice: 100,  sellPrice: 45 },
    herbal_tea:   { name: 'Teh Herbal',    emoji: '🍵',  mana: 80,  buyPrice: 180,  sellPrice: 80 },
    mana_potion:  { name: 'Mana Potion',   emoji: '🧪',  mana: 150, buyPrice: 400,  sellPrice: 180 },
    elixir:       { name: 'Elixir Murni',  emoji: '⚗️',  mana: 300, buyPrice: 1200, sellPrice: 550 },
  },
  ores: {
    coal:     { name: 'Batu Bara',  emoji: '🖤',  buyPrice: 40,   sellPrice: 20 },
    stone:    { name: 'Batu',       emoji: '🪨',  buyPrice: 20,   sellPrice: 8 },
    iron:     { name: 'Besi',       emoji: '⛓️',  buyPrice: 180,  sellPrice: 80 },
    gold:     { name: 'Emas',       emoji: '🌕',  buyPrice: 500,  sellPrice: 220 },
    diamond:  { name: 'Berlian',    emoji: '💎',  buyPrice: 1500, sellPrice: 700 },
    platinum: { name: 'Platinum',   emoji: '🔘',  buyPrice: 3000, sellPrice: 1400 },
  },
  nature: {
    wood:     { name: 'Kayu',       emoji: '🪵',  buyPrice: 40,   sellPrice: 15 },
    leather:  { name: 'Kulit',      emoji: '🟫',  buyPrice: 120,  sellPrice: 50 },
    spice:    { name: 'Rempah',     emoji: '🌶️',  buyPrice: 80,   sellPrice: 35 },
    water_jug:{ name: 'Air',        emoji: '🪣',  buyPrice: 30,   sellPrice: 10 },
    bait:     { name: 'Umpan',      emoji: '🪱',  buyPrice: 25,   sellPrice: 8 },
  },
  fruit: {
    strawberry: { name: 'Stroberi', emoji: '🍓',  buyPrice: 60,   sellPrice: 25 },
    banana:     { name: 'Pisang',   emoji: '🍌',  buyPrice: 50,   sellPrice: 20 },
    grape:      { name: 'Anggur',   emoji: '🍇',  buyPrice: 80,   sellPrice: 35 },
    apple:      { name: 'Apel',     emoji: '🍎',  buyPrice: 55,   sellPrice: 22 },
    orange:     { name: 'Jeruk',    emoji: '🍊',  buyPrice: 45,   sellPrice: 18 },
  },
  vegetable: {
    carrot:   { name: 'Wortel',     emoji: '🥕',  buyPrice: 40,   sellPrice: 15 },
    potato:   { name: 'Kentang',    emoji: '🥔',  buyPrice: 35,   sellPrice: 12 },
    cabbage:  { name: 'Kubis',      emoji: '🥬',  buyPrice: 30,   sellPrice: 10 },
    onion:    { name: 'Bawang',     emoji: '🧅',  buyPrice: 45,   sellPrice: 18 },
    tomato:   { name: 'Tomat',      emoji: '🍅',  buyPrice: 50,   sellPrice: 20 },
    corn:     { name: 'Jagung',     emoji: '🌽',  buyPrice: 40,   sellPrice: 15 },
  },
  fish: {
    anchovy:    { name: 'Ikan Teri',     emoji: '🐟',  buyPrice: 60,   sellPrice: 25 },
    catfish:    { name: 'Lele',          emoji: '🐠',  buyPrice: 100,  sellPrice: 45 },
    carp:       { name: 'Ikan Mas',      emoji: '🐡',  buyPrice: 150,  sellPrice: 65 },
    tuna:       { name: 'Tuna',          emoji: '🐟',  buyPrice: 300,  sellPrice: 140 },
    salmon:     { name: 'Salmon',        emoji: '🐟',  buyPrice: 400,  sellPrice: 185 },
    swordfish:  { name: 'Ikan Pedang',   emoji: '🐡',  buyPrice: 600,  sellPrice: 280 },
    pufferfish: { name: 'Ikan Buntal',   emoji: '🐡',  buyPrice: 800,  sellPrice: 380 },
    squid:      { name: 'Cumi-cumi',     emoji: '🦑',  buyPrice: 250,  sellPrice: 110 },
    shrimp:     { name: 'Udang',         emoji: '🦐',  buyPrice: 200,  sellPrice: 90 },
    clownfish:  { name: 'Ikan Badut',    emoji: '🐠',  buyPrice: 500,  sellPrice: 230 },
  },
  pets: {
    none: { name: 'Tidak Ada', emoji: '🚫' },
  },
  crate: {
    common:    { name: 'Common Crate',    emoji: '📦',  buyPrice: 500,   sellPrice: 0 },
    uncommon:  { name: 'Uncommon Crate',  emoji: '🎁',  buyPrice: 1500,  sellPrice: 0 },
    legendary: { name: 'Legendary Crate', emoji: '🏆',  buyPrice: 5000,  sellPrice: 0 },
    mythic:    { name: 'Mythic Crate',    emoji: '🌌',  buyPrice: 15000, sellPrice: 0 },
    secret:    { name: 'Secret Crate',    emoji: '🔐',  buyPrice: 0,     sellPrice: 0 },
  },
};

const SELLABLE = ['ores','nature','fruit','vegetable','fish','food','drink','crate'];
const BUYABLE  = ['food','drink','tools','weapon','armor','crate'];

const SHOP_ITEMS = {
  food:     Object.entries(ITEMS.food).filter(([,v]) => v.buyPrice > 0),
  drink:    Object.entries(ITEMS.drink).filter(([,v]) => v.buyPrice > 0),
  tools:    Object.entries(ITEMS.tools).filter(([,v]) => !v.exclusive && v.buyPrice > 0),
  weapon:   Object.entries(ITEMS.weapon).filter(([,v]) => !v.exclusive && v.buyPrice > 0),
  armor:    Object.entries(ITEMS.armor).filter(([,v]) => !v.exclusive && v.buyPrice > 0),
  crate:    Object.entries(ITEMS.crate).filter(([,v]) => v.buyPrice > 0),
};

const RECIPES = {
  pickaxe_iron:    { result: 'tools',  needs: { ores: { iron: 10 }, nature: { wood: 5 } } },
  pickaxe_diamond: { result: 'tools',  needs: { ores: { diamond: 5, gold: 10, iron: 20 } } },
  rod_wood:        { result: 'tools',  needs: { nature: { wood: 10 } } },
  rod_premium:     { result: 'tools',  needs: { ores: { gold: 5, iron: 10 }, nature: { wood: 15 } } },
  sword_stone:     { result: 'weapon', needs: { ores: { stone: 20 }, nature: { wood: 5 } } },
  sword_iron:      { result: 'weapon', needs: { ores: { iron: 15, stone: 10 } } },
  sword_diamond:   { result: 'weapon', needs: { ores: { diamond: 8, iron: 20, gold: 5 } } },
  armor_leather:   { result: 'armor',  needs: { nature: { leather: 15, wood: 5 } } },
  armor_iron:      { result: 'armor',  needs: { ores: { iron: 25, coal: 10 }, nature: { leather: 5 } } },
};

const MAPS = {
  forest: {
    name: '🌲 Hutan Hijau',
    hpLoss:   [5, 15],
    manaLoss: [5, 10],
    expGain:  [15, 35],
    loot: [
      { cat: 'nature', key: 'wood',     w: 30 },
      { cat: 'nature', key: 'leather',  w: 15 },
      { cat: 'fruit',  key: 'apple',    w: 20 },
      { cat: 'fruit',  key: 'banana',   w: 15 },
      { cat: 'vegetable', key: 'carrot',w: 10 },
      { cat: 'ores',   key: 'stone',    w: 8 },
      { cat: 'finance',key: 'money',    w: 2, amount: [200, 800] },
    ]
  },
  desert: {
    name: '🏜️ Gurun Pasir',
    hpLoss:   [10, 25],
    manaLoss: [10, 20],
    expGain:  [25, 55],
    loot: [
      { cat: 'ores',   key: 'stone',    w: 25 },
      { cat: 'ores',   key: 'gold',     w: 12 },
      { cat: 'ores',   key: 'coal',     w: 18 },
      { cat: 'nature', key: 'spice',    w: 20 },
      { cat: 'fruit',  key: 'orange',   w: 10 },
      { cat: 'finance',key: 'money',    w: 10, amount: [500, 2000] },
      { cat: 'crate',  key: 'common',   w: 5 },
    ]
  },
  dungeon: {
    name: '🕳️ Dungeon Gelap',
    hpLoss:   [20, 40],
    manaLoss: [15, 30],
    expGain:  [50, 100],
    loot: [
      { cat: 'ores',   key: 'iron',     w: 20 },
      { cat: 'ores',   key: 'diamond',  w: 8 },
      { cat: 'ores',   key: 'platinum', w: 3 },
      { cat: 'ores',   key: 'gold',     w: 12 },
      { cat: 'crate',  key: 'uncommon', w: 5 },
      { cat: 'crate',  key: 'legendary',w: 2 },
      { cat: 'finance',key: 'money',    w: 15, amount: [1000, 5000] },
      { cat: 'weapon', key: 'sword_stone', w: 10 },
      { cat: 'armor',  key: 'armor_leather', w: 10 },
      { cat: 'ores',   key: 'coal',     w: 15 },
    ]
  }
};

const FISHING_TABLE = [
  { key: 'anchovy',   w: 30, rodBonus: 0 },
  { key: 'catfish',   w: 20, rodBonus: 0 },
  { key: 'shrimp',    w: 15, rodBonus: 0 },
  { key: 'squid',     w: 10, rodBonus: 5 },
  { key: 'carp',      w: 8,  rodBonus: 5 },
  { key: 'tuna',      w: 6,  rodBonus: 10 },
  { key: 'salmon',    w: 5,  rodBonus: 10 },
  { key: 'clownfish', w: 3,  rodBonus: 15 },
  { key: 'swordfish', w: 2,  rodBonus: 20 },
  { key: 'pufferfish',w: 1,  rodBonus: 25 },
];

const MINING_TABLE = {
  iron: [
    { key: 'stone',   w: 40 },
    { key: 'coal',    w: 25 },
    { key: 'iron',    w: 20 },
    { key: 'gold',    w: 10 },
    { key: 'diamond', w: 5 },
  ],
  diamond: [
    { key: 'stone',    w: 20 },
    { key: 'coal',     w: 15 },
    { key: 'iron',     w: 20 },
    { key: 'gold',     w: 18 },
    { key: 'diamond',  w: 18 },
    { key: 'platinum', w: 9 },
  ]
};

const DAILY_TABLE = [
  { type: 'money',  value: [3000, 15000],  w: 30 },
  { type: 'exp',    value: [50, 200],      w: 25 },
  { type: 'item',   cat: 'food',   key: 'bread',       amt: [1,3],  w: 10 },
  { type: 'item',   cat: 'food',   key: 'rice',        amt: [1,3],  w: 8 },
  { type: 'item',   cat: 'drink',  key: 'mana_potion', amt: [1,2],  w: 8 },
  { type: 'item',   cat: 'drink',  key: 'herbal_tea',  amt: [1,3],  w: 7 },
  { type: 'item',   cat: 'ores',   key: 'iron',        amt: [3,8],  w: 6 },
  { type: 'item',   cat: 'nature', key: 'wood',        amt: [5,10], w: 4 },
  { type: 'item',   cat: 'crate',  key: 'common',      amt: [1,1],  w: 2 },
];

function weightedPick(table, rodBonus = 0) {
  const total = table.reduce((s, t) => s + t.w + (t.rodBonus || 0) * rodBonus, 0);
  let r = Math.random() * total;
  for (const t of table) {
    r -= t.w + (t.rodBonus || 0) * rodBonus;
    if (r <= 0) return t;
  }
  return table[table.length - 1];
}

function ensureInv(user) {
  const cats = ['ores','nature','fruit','vegetable','fish','food','drink','tools','weapon','armor','crate'];
  if (!user.inventory) user.inventory = {};
  cats.forEach(c => { if (!user.inventory[c]) user.inventory[c] = {}; });
  if (!user.cooldown) user.cooldown = {};
}

function addItem(user, cat, key, amount) {
  ensureInv(user);
  user.inventory[cat][key] = (user.inventory[cat][key] || 0) + amount;
}

function getEquipped(user, slot) {
  if (!user.equipped) return null;
  return user.equipped[slot] || null;
}

function thumbnail(ppuser) {
  return ppuser || 'https://telegra.ph/file/6880771a42bad09dd6087.jpg';
}

async function getPP(fuqi, sender) {
  return fuqi.profilePictureUrl(sender, 'image').catch(() => 'https://telegra.ph/file/6880771a42bad09dd6087.jpg');
}

function sendCard(fuqi, ctx, text, title, body, ppuser) {
  return fuqi.sendMessage(ctx.id, {
    text,
    contextInfo: {
      externalAdReply: {
        title, body,
        thumbnailUrl: thumbnail(ppuser),
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: simpleQuoted(ctx) });
}

export default [

  {
    name: 'profile',
    aliases: ['profil', 'me'],
    description: 'Profil RPG kamu',
    category: 'RPG',
    execute: async (fuqi, ctx, msg) => {
      const user = global.db.user[ctx.sender];
      ensureInv(user);
      const expNeeded = getExpNeeded(user.level);
      const pct = Math.min(100, Math.floor((user.exp / expNeeded) * 100));
      const hpPct  = Math.floor((user.hp / user.hpMax) * 10);
      const manaPct = Math.floor((user.mana / user.manaMax) * 10);
      const hpBar   = '█'.repeat(hpPct) + '░'.repeat(10 - hpPct);
      const manaBar = '█'.repeat(manaPct) + '░'.repeat(10 - manaPct);
      const weapon = getEquipped(user, 'weapon');
      const armor  = getEquipped(user, 'armor');
      const ppuser = await getPP(fuqi, ctx.sender);

      const text = `╭─〔 *RPG PROFILE* 〕─⬿
│
│ 👤 *${user.name}*  │  ID: ${user.id}
│
│ *[ Status ]*
│ ⭐ Level   : ${user.level}
│ ✨ EXP     : ${user.exp}/${expNeeded} (${pct}%)
│
│ *[ Stats ]*
│ ❤️ HP      : ${user.hp}/${user.hpMax}
│    ${hpBar}
│ 🔷 Mana    : ${user.mana}/${user.manaMax}
│    ${manaBar}
│ ⚔️ ATK     : ${user.atk}
│ 🛡️ DEF     : ${user.def}
│
│ *[ Finance ]*
│ 💰 Money   : ${(user.money || 0).toLocaleString()}
│ 🪙 MCoin   : ${(user.mcoin || 0).toLocaleString()}
│
│ *[ Equipment ]*
│ ⚔️ Weapon  : ${weapon ? (ITEMS.weapon[weapon]?.name || weapon) : 'Kosong'}
│ 🛡️ Armor   : ${armor  ? (ITEMS.armor[armor]?.name  || armor)  : 'Kosong'}
│
╰─〔 Yuki Archive RPG 〕─⬿`;

      await sendCard(fuqi, ctx, text, 'RPG PROFILE', `${user.name} | Level ${user.level}`, ppuser);
    }
  },

  {
    name: 'inventory',
    aliases: ['inv', 'bag'],
    description: 'Lihat inventaris',
    category: 'RPG',
    execute: async (fuqi, ctx, msg) => {
      const user = global.db.user[ctx.sender];
      ensureInv(user);
      const ppuser = await getPP(fuqi, ctx.sender);
      const inv = user.inventory;

      const section = (title, cat, src) => {
        let s = `│ *[ ${title} ]*\n`;
        for (const [k, v] of Object.entries(src)) {
          const qty = inv[cat]?.[k] || 0;
          if (qty > 0) s += `│ ${v.emoji} ${v.name} : ${qty}\n`;
        }
        return s + '│\n';
      };

      const sectionAll = (title, cat, src) => {
        let s = `│ *[ ${title} ]*\n`;
        for (const [k, v] of Object.entries(src)) {
          const qty = inv[cat]?.[k] || 0;
          s += `│ ${v.emoji} ${v.name} : ${qty}\n`;
        }
        return s + '│\n';
      };

      let text = `╭─〔 *INVENTORY* 〕─⬿\n│\n`;
      text += sectionAll('Ores', 'ores', ITEMS.ores);
      text += sectionAll('Nature', 'nature', ITEMS.nature);
      text += section('Buah', 'fruit', ITEMS.fruit);
      text += section('Sayuran', 'vegetable', ITEMS.vegetable);
      text += section('Ikan', 'fish', ITEMS.fish);
      text += section('Makanan', 'food', ITEMS.food);
      text += section('Minuman', 'drink', ITEMS.drink);
      text += section('Tools', 'tools', ITEMS.tools);
      text += section('Senjata', 'weapon', ITEMS.weapon);
      text += section('Armor', 'armor', ITEMS.armor);
      text += section('Crate', 'crate', ITEMS.crate);
      text += `│ 💰 Money : ${(user.money||0).toLocaleString()}\n│ 🪙 MCoin : ${(user.mcoin||0).toLocaleString()}\n`;
      text += `╰─〔 Yuki Archive RPG 〕─⬿`;

      await sendCard(fuqi, ctx, text, 'INVENTORY', `${user.name} | Level ${user.level}`, ppuser);
    }
  },

  {
    name: 'equip',
    aliases: ['pasang'],
    description: 'Pasang senjata atau armor',
    category: 'RPG',
    execute: async (fuqi, ctx, msg) => {
      const user = global.db.user[ctx.sender];
      ensureInv(user);
      if (!user.equipped) user.equipped = {};
      const item = ctx.args[0]?.toLowerCase();
      if (!item) return ctx.reply('Cara pakai: .equip [item]\nContoh: .equip sword_iron');

      let slot = null;
      let cat  = null;
      if (ITEMS.weapon[item]) { slot = 'weapon'; cat = 'weapon'; }
      else if (ITEMS.armor[item]) { slot = 'armor'; cat = 'armor'; }
      else return ctx.reply('Item tidak dikenal atau tidak bisa di-equip.');

      if (!(user.inventory[cat]?.[item] > 0)) return ctx.reply(`Kamu tidak memiliki ${ITEMS[cat][item].name}.`);

      const old = user.equipped[slot];
      if (old) {
        user.atk -= (ITEMS.weapon[old]?.atk || 0);
        user.def -= (ITEMS.armor[old]?.def   || 0);
      }
      user.equipped[slot] = item;
      user.atk += (ITEMS.weapon[item]?.atk || 0);
      user.def += (ITEMS.armor[item]?.def   || 0);

      if (db?.write) await db.write(global.db);
      const ppuser = await getPP(fuqi, ctx.sender);
      await sendCard(fuqi, ctx,
        `╭─〔 *EQUIP* 〕─⬿\n│\n│ ✅ ${ITEMS[cat][item].name} dipasang!\n│ ATK : ${user.atk} | DEF : ${user.def}\n│\n╰─〔 Yuki Archive RPG 〕─⬿`,
        'EQUIP', `${user.name} | Level ${user.level}`, ppuser);
    }
  },

  {
    name: 'daily',
    aliases: ['claim'],
    description: 'Klaim hadiah harian',
    category: 'RPG',
    execute: async (fuqi, ctx, msg) => {
      const user = global.db.user[ctx.sender];
      ensureInv(user);
      const now = Date.now();
      const last = user.cooldown.daily || 0;
      if (now - last < 86400000) {
        const rem = 86400000 - (now - last);
        const h = Math.floor(rem / 3600000);
        const m = Math.floor((rem % 3600000) / 60000);
        return ctx.reply(`❌ Daily sudah diambil! Tunggu *${h}j ${m}m* lagi.`);
      }

      const rewards = [];
      const rolls = 3 + Math.floor(user.level / 5);
      for (let i = 0; i < rolls; i++) {
        const r = weightedPick(DAILY_TABLE);
        if (r.type === 'money') {
          const amt = rand(r.value[0], r.value[1]);
          user.money = (user.money || 0) + amt;
          rewards.push(`💰 +${amt.toLocaleString()} Money`);
        } else if (r.type === 'exp') {
          const amt = rand(r.value[0], r.value[1]);
          user.exp = (user.exp || 0) + amt;
          rewards.push(`✨ +${amt} EXP`);
        } else {
          const amt = rand(r.amt[0], r.amt[1]);
          addItem(user, r.cat, r.key, amt);
          rewards.push(`${ITEMS[r.cat][r.key].emoji} +${amt} ${ITEMS[r.cat][r.key].name}`);
        }
      }

      user.cooldown.daily = now;
      if (db?.write) await db.write(global.db);
      const ppuser = await getPP(fuqi, ctx.sender);

      const text = `╭─〔 *DAILY REWARD* 〕─⬿\n│\n│ ✅ Reward hari ini:\n│\n${rewards.map(r => `│ ${r}`).join('\n')}\n│\n│ 💰 Money: ${(user.money||0).toLocaleString()}\n╰─〔 Yuki Archive RPG 〕─⬿`;
      await sendCard(fuqi, ctx, text, 'DAILY REWARD', `${user.name} | Level ${user.level}`, ppuser);
    }
  },

  {
    name: 'adventure',
    aliases: ['adv', 'cari'],
    description: 'Petualangan ke map pilihan',
    category: 'RPG',
    execute: async (fuqi, ctx, msg) => {
      const user = global.db.user[ctx.sender];
      ensureInv(user);

      const mapKey = ctx.args[0]?.toLowerCase();
      if (!mapKey || !MAPS[mapKey]) {
        const list = Object.entries(MAPS).map(([k,v]) => `• *${k}* — ${v.name}`).join('\n');
        return ctx.reply(`*Pilih map adventure:*\n${list}\n\nCara: .adv [map]\nContoh: .adv forest`);
      }

      const cd = checkCooldown(user.cooldown.adventure || 0, 5 * 60000);
      if (!cd.available) return ctx.reply(`⏳ Lelah! Tunggu *${cd.minutes}m ${cd.seconds}s* lagi.`);

      const map = MAPS[mapKey];
      const hpLoss   = rand(...map.hpLoss);
      const manaLoss = rand(...map.manaLoss);
      const expGain  = rand(...map.expGain);

      if (user.hp <= hpLoss) return ctx.reply(`❌ HP tidak cukup untuk masuk ${map.name}! Makan dulu.`);
      if (user.mana <= manaLoss) return ctx.reply(`❌ Mana tidak cukup untuk masuk ${map.name}! Minum dulu.`);

      user.hp   -= hpLoss;
      user.mana -= manaLoss;
      user.exp  += expGain;

      const loot = weightedPick(map.loot);
      let lootText = '';
      if (loot.cat === 'finance') {
        const amt = rand(...loot.amount);
        user.money += amt;
        lootText = `💰 +${amt.toLocaleString()} Money`;
      } else {
        const amt = rand(1, 4);
        addItem(user, loot.cat, loot.key, amt);
        lootText = `${ITEMS[loot.cat][loot.key].emoji} +${amt} ${ITEMS[loot.cat][loot.key].name}`;
      }

      user.cooldown.adventure = Date.now();
      if (db?.write) await db.write(global.db);
      const ppuser = await getPP(fuqi, ctx.sender);

      const text = `╭─〔 *ADVENTURE* 〕─⬿\n│\n│ 🗺️ Map : ${map.name}\n│\n│ *Loot:*\n│ ${lootText}\n│\n│ *Hasil:*\n│ ✨ +${expGain} EXP\n│ ❤️ -${hpLoss} HP  (${user.hp}/${user.hpMax})\n│ 🔷 -${manaLoss} Mana (${user.mana}/${user.manaMax})\n│\n╰─〔 Yuki Archive RPG 〕─⬿`;
      await sendCard(fuqi, ctx, text, 'ADVENTURE', `${user.name} | Level ${user.level}`, ppuser);
    }
  },

  {
    name: 'mine',
    aliases: ['tambang'],
    description: 'Menambang bijih (butuh beliung)',
    category: 'RPG',
    execute: async (fuqi, ctx, msg) => {
      const user = global.db.user[ctx.sender];
      ensureInv(user);

      let pickTier = null;
      if (user.inventory.tools?.pickaxe_diamond > 0) pickTier = 'diamond';
      else if (user.inventory.tools?.pickaxe_iron > 0) pickTier = 'iron';
      else return ctx.reply('❌ Kamu tidak punya beliung! Buat dengan *.craft pickaxe_iron*');

      const cd = checkCooldown(user.cooldown.mine || 0, 3 * 60000);
      if (!cd.available) return ctx.reply(`⛏️ Tambang dingin! Tunggu *${cd.minutes}m ${cd.seconds}s* lagi.`);

      const manaLoss = pickTier === 'diamond' ? rand(8, 18) : rand(5, 12);
      if (user.mana < manaLoss) return ctx.reply(`❌ Mana tidak cukup (butuh ${manaLoss}, punya ${user.mana}).`);
      user.mana -= manaLoss;

      const table = MINING_TABLE[pickTier];
      const results = [];
      const count = pickTier === 'diamond' ? rand(3, 6) : rand(2, 4);
      for (let i = 0; i < count; i++) {
        const ore = weightedPick(table);
        const amt = rand(1, pickTier === 'diamond' ? 4 : 3);
        addItem(user, 'ores', ore.key, amt);
        results.push(`${ITEMS.ores[ore.key].emoji} +${amt} ${ITEMS.ores[ore.key].name}`);
      }

      const expGain = rand(20, 45);
      user.exp += expGain;
      user.cooldown.mine = Date.now();
      if (db?.write) await db.write(global.db);
      const ppuser = await getPP(fuqi, ctx.sender);

      const text = `╭─〔 *MINING* 〕─⬿\n│\n│ ⛏️ Beliung: ${ITEMS.tools['pickaxe_'+pickTier].name}\n│\n│ *Hasil:*\n${results.map(r=>`│ ${r}`).join('\n')}\n│\n│ ✨ +${expGain} EXP\n│ 🔷 -${manaLoss} Mana (${user.mana}/${user.manaMax})\n│\n╰─〔 Yuki Archive RPG 〕─⬿`;
      await sendCard(fuqi, ctx, text, 'MINING', `${user.name} | Level ${user.level}`, ppuser);
    }
  },

  {
    name: 'fish',
    aliases: ['pancing', 'fishing'],
    description: 'Memancing (butuh pancing & umpan)',
    category: 'RPG',
    execute: async (fuqi, ctx, msg) => {
      const user = global.db.user[ctx.sender];
      ensureInv(user);

      let rodTier = null;
      if (user.inventory.tools?.rod_premium > 0) rodTier = 'premium';
      else if (user.inventory.tools?.rod_wood > 0) rodTier = 'wood';
      else return ctx.reply('❌ Kamu tidak punya pancing! Buat dengan *.craft rod_wood*');

      if (!(user.inventory.nature?.bait > 0)) return ctx.reply('❌ Kamu tidak punya umpan! Beli di toko atau cari di adventure.');

      const cd = checkCooldown(user.cooldown.fish || 0, 2 * 60000);
      if (!cd.available) return ctx.reply(`🎣 Ikan belum datang! Tunggu *${cd.minutes}m ${cd.seconds}s* lagi.`);

      user.inventory.nature.bait -= 1;
      const bonus = rodTier === 'premium' ? 1 : 0;
      const caught = weightedPick(FISHING_TABLE, bonus);
      const amt = rand(1, 2);
      addItem(user, 'fish', caught.key, amt);

      const manaLoss = rand(3, 8);
      if (user.mana >= manaLoss) user.mana -= manaLoss;
      const expGain = rand(15, 35);
      user.exp += expGain;
      user.cooldown.fish = Date.now();
      if (db?.write) await db.write(global.db);
      const ppuser = await getPP(fuqi, ctx.sender);

      const fishItem = ITEMS.fish[caught.key];
      const text = `╭─〔 *FISHING* 〕─⬿\n│\n│ 🎣 Pancing: ${ITEMS.tools['rod_'+rodTier].name}\n│\n│ *Hasil:*\n│ ${fishItem.emoji} ${amt}x ${fishItem.name}\n│ 💵 Nilai jual: ${(fishItem.sellPrice*amt).toLocaleString()}\n│\n│ ✨ +${expGain} EXP\n│ 🔷 -${manaLoss} Mana (${user.mana}/${user.manaMax})\n│\n╰─〔 Yuki Archive RPG 〕─⬿`;
      await sendCard(fuqi, ctx, text, 'FISHING', `${user.name} | Level ${user.level}`, ppuser);
    }
  },

  {
    name: 'craft',
    aliases: ['buat'],
    description: 'Membuat item dari bahan',
    category: 'RPG',
    execute: async (fuqi, ctx, msg) => {
      const user = global.db.user[ctx.sender];
      ensureInv(user);

      if (!ctx.args.length) {
        let list = `*Daftar Resep Craft:*\n\n`;
        for (const [name, recipe] of Object.entries(RECIPES)) {
          const cat = recipe.result;
          const idata = ITEMS[cat]?.[name];
          if (!idata) continue;
          list += `*${idata.emoji} ${idata.name}* (${name})\n`;
          for (const [mcat, matMap] of Object.entries(recipe.needs)) {
            for (const [mkey, qty] of Object.entries(matMap)) {
              list += `  • ${ITEMS[mcat]?.[mkey]?.name || mkey} x${qty}\n`;
            }
          }
          list += '\n';
        }
        list += 'Cara: .craft [item]\nContoh: .craft pickaxe_iron';
        return ctx.reply(list);
      }

      const target = ctx.args[0].toLowerCase();
      const recipe = RECIPES[target];
      if (!recipe) return ctx.reply('❌ Resep tidak dikenal. Ketik *.craft* untuk melihat daftar.');

      const idata = ITEMS[recipe.result]?.[target];
      if (idata?.exclusive) return ctx.reply('❌ Item ini tidak bisa di-craft (Exclusive).');

      const missing = [];
      for (const [mcat, matMap] of Object.entries(recipe.needs)) {
        for (const [mkey, qty] of Object.entries(matMap)) {
          const have = user.inventory[mcat]?.[mkey] || 0;
          if (have < qty) missing.push(`${ITEMS[mcat]?.[mkey]?.name || mkey} (butuh ${qty}, punya ${have})`);
        }
      }
      if (missing.length) return ctx.reply(`❌ Bahan kurang:\n${missing.join('\n')}`);

      for (const [mcat, matMap] of Object.entries(recipe.needs)) {
        for (const [mkey, qty] of Object.entries(matMap)) {
          user.inventory[mcat][mkey] = (user.inventory[mcat][mkey] || 0) - qty;
        }
      }
      addItem(user, recipe.result, target, 1);

      if (db?.write) await db.write(global.db);
      const ppuser = await getPP(fuqi, ctx.sender);

      let matText = '';
      for (const [mcat, matMap] of Object.entries(recipe.needs)) {
        for (const [mkey, qty] of Object.entries(matMap)) {
          matText += `│ • ${ITEMS[mcat]?.[mkey]?.emoji || ''} ${ITEMS[mcat]?.[mkey]?.name || mkey} -${qty}\n`;
        }
      }
      const text = `╭─〔 *CRAFT SUCCESS* 〕─⬿\n│\n│ ✅ ${idata?.emoji || ''} *${idata?.name || target}* berhasil dibuat!\n│\n│ *Bahan terpakai:*\n${matText}│\n╰─〔 Yuki Archive RPG 〕─⬿`;
      await sendCard(fuqi, ctx, text, 'CRAFT', `${user.name} | Level ${user.level}`, ppuser);
    }
  },

  {
    name: 'sell',
    aliases: ['jual'],
    description: 'Jual item atau lihat daftar item yang bisa dijual',
    category: 'RPG',
    execute: async (fuqi, ctx, msg) => {
      const user = global.db.user[ctx.sender];
      ensureInv(user);
      const args = ctx.args;

      if (!args.length) {
        let text = `╭─〔 *DAFTAR JUAL* 〕─⬿\n│\n`;
        for (const cat of SELLABLE) {
          if (!ITEMS[cat]) continue;
          const entries = Object.entries(ITEMS[cat]).filter(([,v]) => v.sellPrice > 0);
          if (!entries.length) continue;
          text += `│ *[ ${cat.toUpperCase()} ]*\n`;
          entries.forEach(([k,v]) => {
            text += `│ ${v.emoji} ${v.name} (${k}) — 💰${v.sellPrice.toLocaleString()}\n`;
          });
          text += '│\n';
        }
        text += `│ Cara: .sell [kategori] [item] [jumlah]\n│ Contoh: .sell ores iron 5\n╰─〔 Yuki Archive RPG 〕─⬿`;
        return ctx.reply(text);
      }

      const [cat, item, qtyStr] = args;
      const qty = Math.max(1, parseInt(qtyStr) || 1);

      if (!SELLABLE.includes(cat) || !ITEMS[cat]?.[item]) return ctx.reply('❌ Kategori atau item tidak valid. Ketik *.sell* untuk melihat daftar.');
      if (!ITEMS[cat][item].sellPrice) return ctx.reply('❌ Item ini tidak bisa dijual.');

      const have = user.inventory[cat]?.[item] || 0;
      if (have < qty) return ctx.reply(`❌ Kamu hanya punya ${have} ${ITEMS[cat][item].name}.`);

      const total = ITEMS[cat][item].sellPrice * qty;
      user.inventory[cat][item] -= qty;
      user.money = (user.money || 0) + total;

      if (db?.write) await db.write(global.db);
      const ppuser = await getPP(fuqi, ctx.sender);

      const text = `╭─〔 *SOLD* 〕─⬿\n│\n│ ✅ Terjual *${qty}x ${ITEMS[cat][item].name}*\n│ • Harga/unit : ${ITEMS[cat][item].sellPrice.toLocaleString()}\n│ • Total      : +${total.toLocaleString()} Money\n│\n│ 💰 Money kamu: ${user.money.toLocaleString()}\n╰─〔 Yuki Archive RPG 〕─⬿`;
      await sendCard(fuqi, ctx, text, 'SELL', `${user.name} | Level ${user.level}`, ppuser);
    }
  },

  {
    name: 'buy',
    aliases: ['beli'],
    description: 'Beli item atau lihat daftar toko',
    category: 'RPG',
    execute: async (fuqi, ctx, msg) => {
      const user = global.db.user[ctx.sender];
      ensureInv(user);
      const args = ctx.args;

      if (!args.length) {
        let text = `╭─〔 *TOKO* 〕─⬿\n│\n`;
        for (const [cat, entries] of Object.entries(SHOP_ITEMS)) {
          text += `│ *[ ${cat.toUpperCase()} ]*\n`;
          entries.forEach(([k,v]) => {
            text += `│ ${v.emoji} ${v.name} (${k}) — 💰${v.buyPrice.toLocaleString()}\n`;
          });
          text += '│\n';
        }
        text += `│ Cara: .buy [kategori] [item] [jumlah]\n│ Contoh: .buy food bread 3\n╰─〔 Yuki Archive RPG 〕─⬿`;
        return ctx.reply(text);
      }

      const [cat, item, qtyStr] = args;
      const qty = Math.max(1, parseInt(qtyStr) || 1);

      if (!BUYABLE.includes(cat) || !ITEMS[cat]?.[item]) return ctx.reply('❌ Kategori atau item tidak valid. Ketik *.buy* untuk melihat toko.');
      if (ITEMS[cat][item].exclusive) return ctx.reply('❌ Item Exclusive tidak bisa dibeli di toko.');
      if (!ITEMS[cat][item].buyPrice) return ctx.reply('❌ Item ini tidak tersedia di toko.');

      const total = ITEMS[cat][item].buyPrice * qty;
      if ((user.money || 0) < total) return ctx.reply(`❌ Money tidak cukup! Butuh ${total.toLocaleString()}, punya ${(user.money||0).toLocaleString()}.`);

      user.money -= total;
      addItem(user, cat, item, qty);

      if (db?.write) await db.write(global.db);
      const ppuser = await getPP(fuqi, ctx.sender);

      const text = `╭─〔 *PURCHASE* 〕─⬿\n│\n│ ✅ Dibeli *${qty}x ${ITEMS[cat][item].name}*\n│ • Harga/unit : ${ITEMS[cat][item].buyPrice.toLocaleString()}\n│ • Total      : -${total.toLocaleString()} Money\n│\n│ 💰 Money kamu: ${user.money.toLocaleString()}\n╰─〔 Yuki Archive RPG 〕─⬿`;
      await sendCard(fuqi, ctx, text, 'BUY', `${user.name} | Level ${user.level}`, ppuser);
    }
  },

  {
    name: 'eat',
    aliases: ['makan'],
    description: 'Makan makanan untuk memulihkan HP',
    category: 'RPG',
    execute: async (fuqi, ctx, msg) => {
      const user = global.db.user[ctx.sender];
      ensureInv(user);
      const food = ctx.args[0]?.toLowerCase();
      if (!food) return ctx.reply('Cara: .eat [makanan]\nContoh: .eat bread\nLihat daftar: .inv');
      if (!ITEMS.food[food]) return ctx.reply('❌ Makanan tidak dikenal.');
      if (!(user.inventory.food?.[food] > 0)) return ctx.reply(`❌ Kamu tidak punya ${ITEMS.food[food].name}.`);
      if (user.hp >= user.hpMax) return ctx.reply('❤️ HP sudah penuh!');

      const heal = ITEMS.food[food].heal;
      const oldHp = user.hp;
      user.hp = Math.min(user.hp + heal, user.hpMax);
      user.inventory.food[food] -= 1;
      if (db?.write) await db.write(global.db);
      const ppuser = await getPP(fuqi, ctx.sender);

      await sendCard(fuqi, ctx,
        `╭─〔 *EAT* 〕─⬿\n│\n│ ${ITEMS.food[food].emoji} Kamu makan *${ITEMS.food[food].name}*\n│ ❤️ HP : ${oldHp} → ${user.hp}/${user.hpMax} (+${heal})\n│\n╰─〔 Yuki Archive RPG 〕─⬿`,
        'EAT', `${user.name} | Level ${user.level}`, ppuser);
    }
  },

  {
    name: 'drink',
    aliases: ['minum'],
    description: 'Minum minuman untuk memulihkan Mana',
    category: 'RPG',
    execute: async (fuqi, ctx, msg) => {
      const user = global.db.user[ctx.sender];
      ensureInv(user);
      const drink = ctx.args[0]?.toLowerCase();
      if (!drink) return ctx.reply('Cara: .drink [minuman]\nContoh: .drink water\nLihat daftar: .inv');
      if (!ITEMS.drink[drink]) return ctx.reply('❌ Minuman tidak dikenal.');
      if (!(user.inventory.drink?.[drink] > 0)) return ctx.reply(`❌ Kamu tidak punya ${ITEMS.drink[drink].name}.`);
      if (user.mana >= user.manaMax) return ctx.reply('🔷 Mana sudah penuh!');

      const restore = ITEMS.drink[drink].mana;
      const oldMana = user.mana;
      user.mana = Math.min(user.mana + restore, user.manaMax);
      user.inventory.drink[drink] -= 1;
      if (db?.write) await db.write(global.db);
      const ppuser = await getPP(fuqi, ctx.sender);

      await sendCard(fuqi, ctx,
        `╭─〔 *DRINK* 〕─⬿\n│\n│ ${ITEMS.drink[drink].emoji} Kamu minum *${ITEMS.drink[drink].name}*\n│ 🔷 Mana : ${oldMana} → ${user.mana}/${user.manaMax} (+${restore})\n│\n╰─〔 Yuki Archive RPG 〕─⬿`,
        'DRINK', `${user.name} | Level ${user.level}`, ppuser);
    }
  },

  {
    name: 'rest',
    aliases: ['istirahat'],
    description: 'Istirahat untuk memulihkan HP & Mana',
    category: 'RPG',
    execute: async (fuqi, ctx, msg) => {
      const user = global.db.user[ctx.sender];
      ensureInv(user);
      const cd = checkCooldown(user.cooldown.rest || 0, 2 * 60000);
      if (!cd.available) return ctx.reply(`⏳ Baru saja istirahat! Tunggu *${cd.minutes}m ${cd.seconds}s* lagi.`);
      if (user.hp >= user.hpMax && user.mana >= user.manaMax) return ctx.reply('HP dan Mana sudah penuh!');

      const hpRec   = Math.min(20, user.hpMax - user.hp);
      const manaRec = Math.min(10, user.manaMax - user.mana);
      user.hp   += hpRec;
      user.mana += manaRec;
      user.cooldown.rest = Date.now();
      if (db?.write) await db.write(global.db);
      const ppuser = await getPP(fuqi, ctx.sender);

      await sendCard(fuqi, ctx,
        `╭─〔 *REST* 〕─⬿\n│\n│ 💤 Kamu beristirahat...\n│\n│ ❤️ HP   : +${hpRec} (${user.hp}/${user.hpMax})\n│ 🔷 Mana : +${manaRec} (${user.mana}/${user.manaMax})\n│\n╰─〔 Yuki Archive RPG 〕─⬿`,
        'REST', `${user.name} | Level ${user.level}`, ppuser);
    }
  },

  {
    name: 'leaderboard',
    aliases: ['lb', 'top'],
    description: 'Top 10 pemain',
    category: 'RPG',
    execute: async (fuqi, ctx, msg) => {
      if (!global.db?.user) return ctx.reply('Belum ada pemain.');
      const users = Object.values(global.db.user)
        .map(u => ({ name: u.name || 'Unknown', level: u.level || 1, totalExp: getTotalExpForLevel(u.level) + (u.exp || 0), money: u.money || 0 }))
        .sort((a, b) => b.totalExp - a.totalExp)
        .slice(0, 10);

      let text = `╭─〔 *LEADERBOARD* 〕─⬿\n│\n│ *Top 10 Players:*\n│\n`;
      users.forEach((u, i) => {
        const medal = ['🥇','🥈','🥉'][i] || '🎖️';
        text += `│ ${medal} #${i+1}. ${u.name}  Lv.${u.level}\n│    💰 ${u.money.toLocaleString()}\n`;
      });
      text += `│\n╰─〔 Yuki Archive RPG 〕─⬿`;
      await ctx.reply(text);
    }
  }
];
