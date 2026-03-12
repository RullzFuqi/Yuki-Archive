import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import chokidar from 'chokidar';
import chalk from 'chalk';

export class CommandLoader {
  constructor(opts = {}) {
    this.pluginsDir = path.resolve(opts.dir || path.join(process.cwd(), 'commands'));
    this.logger = opts.logger || console;
    this.commandMap = new Map();
    this.fileMap = new Map();
    this.watcher = null;
    this._timers = new Map();
  }

  async _importFresh(filePath) {
    let href = pathToFileURL(filePath).href + `?update=${Date.now()}`;
    return import(href);
  }

  async loadPlugin(filePath) {
    filePath = path.resolve(filePath);
    try {
      let mod = await this._importFresh(filePath);
      let exported = mod?.default ?? mod;
      let cmds = Array.isArray(exported) ? exported : [exported];
      if (!cmds.length) return;
      await this.unloadPlugin(filePath);
      let names = [];
      for (let cmd of cmds) {
        if (!cmd || !cmd.name || typeof cmd.execute !== 'function') {
          this.logger.warn(chalk.yellow(`[SKIP] Invalid command in ${path.basename(filePath)}`));
          continue;
        }
        let name = String(cmd.name).toLowerCase();
        if (this.commandMap.has(name)) {
          this.logger.warn(chalk.yellow(`[SKIP] Duplicate command ${name} in ${path.basename(filePath)}`));
          continue;
        }
        let entry = {
          name,
          aliases: Array.isArray(cmd.aliases) ? cmd.aliases.map(a => String(a).toLowerCase()) : [],
          description: cmd.description || '',
          category: cmd.category || path.basename(path.dirname(filePath)),
          execute: cmd.execute,
          filePath
        };
        this.commandMap.set(name, entry);
        for (let al of entry.aliases) {
          if (!this.commandMap.has(al)) this.commandMap.set(al, entry);
        }
        names.push(name);
      }
      if (names.length) {
        this.fileMap.set(filePath, names);
        this.logger.log(chalk.green(`[LOAD] ${path.basename(filePath)} (${names.length} command${names.length > 1 ? 's' : ''})`));
      }
    } catch (e) {
      this.logger.error(chalk.red(`[ERROR] Failed to load ${path.basename(filePath)}: ${e.message}`));
    }
  }

  async unloadPlugin(filePath) {
    filePath = path.resolve(filePath);
    let names = this.fileMap.get(filePath);
    if (!names) return;
    for (let name of names) {
      let entry = this.commandMap.get(name);
      if (entry && entry.filePath === filePath) this.commandMap.delete(name);
      if (entry && Array.isArray(entry.aliases)) {
        for (let al of entry.aliases) {
          let e = this.commandMap.get(al);
          if (e && e.filePath === filePath) this.commandMap.delete(al);
        }
      }
    }
    this.fileMap.delete(filePath);
    this.logger.log(chalk.red(`[UNLOAD] ${path.basename(filePath)}`));
  }

  async reloadPlugin(filePath) {
    filePath = path.resolve(filePath);
    this.logger.log(chalk.yellow(`[RELOAD] ${path.basename(filePath)}`));
    await this.unloadPlugin(filePath);
    await this.loadPlugin(filePath);
  }

  async loadAll() {
    try {
      let entries = await fs.promises.readdir(this.pluginsDir, { withFileTypes: true });
      for (let e of entries) {
        if (e.isFile() && e.name.endsWith('.js')) await this.loadPlugin(path.join(this.pluginsDir, e.name));
      }
    } catch (err) {
      this.logger.error(chalk.red(`[ERROR] Scan plugins error: ${err.message}`));
    }
  }

  _debounce(key, fn, ms = 120) {
    if (this._timers.has(key)) clearTimeout(this._timers.get(key));
    let t = setTimeout(() => { this._timers.delete(key); fn(); }, ms);
    this._timers.set(key, t);
  }

  watch() {
    if (this.watcher) return;
    this.watcher = chokidar.watch(this.pluginsDir, { ignoreInitial: true, persistent: true });
    this.watcher
      .on('add', fp => { if (fp.endsWith('.js')) this._debounce(fp, () => this.loadPlugin(fp)); })
      .on('change', fp => { if (fp.endsWith('.js')) this._debounce(fp, () => this.reloadPlugin(fp)); })
      .on('unlink', fp => { if (fp.endsWith('.js')) this._debounce(fp, () => this.unloadPlugin(fp)); });
  }

  getCommand(name) {
    if (!name) return undefined;
    return this.commandMap.get(String(name).toLowerCase());
  }

  listCommands() {
    return Array.from(new Set([...this.commandMap.keys()]));
  }

  getCommandsByCategory() {
    const categories = {};
    const uniqueCommands = new Map();
    
    for (const [name, cmd] of this.commandMap.entries()) {
      if (cmd.name === name) {
        uniqueCommands.set(name, cmd);
      }
    }
    
    for (const [name, cmd] of uniqueCommands) {
      const cat = cmd.category || 'Lainnya';
      if (!categories[cat]) categories[cat] = [];
      
      let cmdText = `!${name}`;
      if (cmd.aliases && cmd.aliases.length > 0) {
        cmdText += ` (${cmd.aliases.join('|')})`;
      }
      categories[cat].push({ name, text: cmdText, description: cmd.description });
    }
    
    return categories;
  }

  async executeCommand(name, context) {
    let entry = this.getCommand(name);
    if (!entry) throw new Error(`Command not found: ${name}`);
    return entry.execute(context);
  }
}