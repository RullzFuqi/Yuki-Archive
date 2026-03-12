import fs from "fs"

const file = "./library/database/database.json"

if (!fs.existsSync(file)) {
  fs.writeFileSync(file, JSON.stringify({}, null, 2))
}

let data = JSON.parse(fs.readFileSync(file))

function read() {
  data = JSON.parse(fs.readFileSync(file))
  return data
}

function write() {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function get(path) {
  return path.split(".").reduce((a,b)=>a?.[b], data)
}

function set(path, value) {
  const keys = path.split(".")
  const last = keys.pop()

  let obj = data
  for (let k of keys) {
    if (!obj[k]) obj[k] = {}
    obj = obj[k]
  }

  obj[last] = value
  write()
}

function del(path) {
  const keys = path.split(".")
  const last = keys.pop()

  let obj = data
  for (let k of keys) {
    if (!obj[k]) return
    obj = obj[k]
  }

  delete obj[last]
  write()
}

export default {
  read,
  write,
  get,
  set,
  delete: del
}