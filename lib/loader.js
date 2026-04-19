import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import chokidar from "chokidar";
import chalk from "chalk";

export default class Loader {
  constructor(dir = "./plugins") {
    this.dir = path.resolve(dir);
    this.plugins = new Map();
    this.fileMap = new Map();
    this.watcher = null;
  }

  _key(p, fp, idx) {
    if (typeof p === "object" && p?.name) return String(p.name).toLowerCase();
    if (typeof p === "function" && p.command) {
      if (p.command instanceof RegExp) {
        const src = p.command.source
          .replace(/^\^[\[(]?/, "")
          .split(/[|)\]$\\^]/)[0]
          .replace(/[?*+]/g, "");
        if (src) return src.toLowerCase();
      }
      if (Array.isArray(p.command)) return String(p.command[0]).toLowerCase();
      if (typeof p.command === "string") return p.command.toLowerCase();
    }
    return path.relative(this.dir, fp) + "#" + idx;
  }

  async load(fp) {
    fp = path.resolve(fp);
    try {
      const mod = await import(pathToFileURL(fp).href + "?t=" + Date.now());
      const plugin = mod?.default;
      if (!plugin) return;
      this.unload(fp);
      const list = Array.isArray(plugin) ? plugin : [plugin];
      const names = [];
      for (const p of list) {
        if (!p) continue;
        const isNew = typeof p === "object" && typeof p.handle === "function";
        const isOld = typeof p === "function";
        const isHook =
          typeof p === "object" &&
          (typeof p.all === "function" || typeof p.before === "function");
        if (!isNew && !isOld && !isHook) continue;
        const key = this._key(p, fp, names.length);
        this.plugins.set(key, p);
        names.push(key);
      }
      if (names.length) this.fileMap.set(fp, names);
    } catch (e) {
      console.log(
        chalk.red("  ✗ " + path.relative(this.dir, fp) + ": " + e.message),
      );
    }
  }

  unload(fp) {
    fp = path.resolve(fp);
    for (const k of this.fileMap.get(fp) || []) this.plugins.delete(k);
    this.fileMap.delete(fp);
  }

  async reload(fp) {
    this.unload(fp);
    await this.load(fp);
  }

  async loadAll() {
    const cats = {};
    const files = this._walk(this.dir);
    for (const fp of files) {
      const before = this.plugins.size;
      await this.load(fp);
      if (this.plugins.size > before) {
        const cat = path.basename(path.dirname(fp));
        cats[cat] = (cats[cat] || 0) + (this.plugins.size - before);
      }
    }
    this._summary(cats);
  }

  _walk(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const fp = path.join(dir, e.name);
      return e.isDirectory()
        ? this._walk(fp)
        : e.name.endsWith(".js")
          ? [fp]
          : [];
    });
  }

  _summary(cats) {
    const W = 34;
    console.log(chalk.blue("\n╔" + "═".repeat(W) + "╗"));
    console.log(
      chalk.blue("║") +
        chalk.bold.white(" PLUGIN LOADER SUMMARY".padEnd(W)) +
        chalk.blue("║"),
    );
    console.log(chalk.blue("╠" + "═".repeat(W) + "╣"));
    for (const [c, n] of Object.entries(cats).sort(([a], [b]) =>
      a.localeCompare(b),
    ))
      console.log(
        chalk.blue("║ ") +
          chalk.green(c.padEnd(14)) +
          chalk.white((n + " plugin" + (n > 1 ? "s" : "")).padEnd(W - 16)) +
          chalk.blue("║"),
      );
    console.log(chalk.blue("╠" + "═".repeat(W) + "╣"));
    console.log(
      chalk.blue("║ ") +
        chalk.yellow(
          ("Total: " + this.plugins.size + " plugins loaded").padEnd(W - 2),
        ) +
        chalk.blue("║"),
    );
    console.log(chalk.blue("╚" + "═".repeat(W) + "╝\n"));
  }

  watch(rootDir = ".") {
    if (this.watcher) return;
    this.watcher = chokidar.watch(rootDir, {
      ignored: [/node_modules/, /session/, /database/, /\.git/, /tmp/],
      ignoreInitial: true,
      persistent: true,
      awaitWriteFinish: { stabilityThreshold: 500 },
    });

    this.watcher.on("change", async (fp) => {
      if (!fp.endsWith(".js")) return;
      const rel = path.relative(process.cwd(), fp);
      if (path.resolve(fp).startsWith(this.dir)) {
        await this.reload(fp);
        console.log(chalk.yellow("[~] plugin: " + rel));
      } else {
        console.log(chalk.cyan("[~] " + rel + " → restarting..."));
        process.exit(0);
      }
    });

    this.watcher.on("add", async (fp) => {
      if (!fp.endsWith(".js") || !path.resolve(fp).startsWith(this.dir)) return;
      await this.load(fp);
      console.log(chalk.green("[+] " + path.relative(process.cwd(), fp)));
    });

    this.watcher.on("unlink", (fp) => {
      if (!fp.endsWith(".js") || !path.resolve(fp).startsWith(this.dir)) return;
      this.unload(fp);
      console.log(chalk.red("[-] " + path.relative(process.cwd(), fp)));
    });
  }

  getAll() {
    return this.plugins;
  }
}
