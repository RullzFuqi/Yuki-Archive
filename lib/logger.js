import chalk from "chalk";
const ts = () =>
  chalk.gray(new Date().toLocaleTimeString("id-ID", { hour12: false }));
const pad = (s, n = 8) => String(s).padEnd(n);
export default {
  info: (...a) => console.log(ts(), chalk.cyanBright(pad("INFO")), ...a),
  ok: (...a) => console.log(ts(), chalk.greenBright(pad("OK")), ...a),
  warn: (...a) => console.log(ts(), chalk.yellowBright(pad("WARN")), ...a),
  error: (...a) => console.log(ts(), chalk.redBright(pad("ERROR")), ...a),
  cmd: (who, cmd, isGrp) =>
    console.log(
      ts(),
      chalk.magentaBright(pad("CMD")),
      chalk.white(cmd),
      chalk.gray("<"),
      chalk.cyan(who),
      isGrp ? chalk.blue("[G]") : chalk.yellow("[P]"),
    ),
  conn: (m) => console.log(ts(), chalk.cyanBright(pad("CONN")), chalk.white(m)),
};
