import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../database",
);
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const TABLES = {
  users: "users.json",
  groups: "groups.json",
  response: "response.json",
  stats: "stats.json",
};

const cache = {};

const fp = (t) => path.join(DIR, TABLES[t]);

function read(t) {
  if (cache[t]) return cache[t];
  try {
    if (!fs.existsSync(fp(t))) fs.writeFileSync(fp(t), "{}");
    cache[t] = JSON.parse(fs.readFileSync(fp(t), "utf-8"));
  } catch {
    cache[t] = {};
  }
  return cache[t];
}

function write(t) {
  if (t) {
    if (cache[t]) fs.writeFileSync(fp(t), JSON.stringify(cache[t], null, 2));
  } else {
    for (const k of Object.keys(TABLES))
      if (cache[k]) fs.writeFileSync(fp(k), JSON.stringify(cache[k], null, 2));
  }
}

function init() {
  global.db = {};
  for (const k of Object.keys(TABLES)) global.db[k] = read(k);
}

export default { init, read, write };
