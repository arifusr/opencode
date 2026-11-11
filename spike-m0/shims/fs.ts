// Browser shim for node:fs and node:fs/promises — the web runtime has no host
// filesystem. Every call fails with a clear error; the real file service comes
// from the FileSystem layer replacement (OPFS driver), and the modules that
// import fs directly are exactly the ones whose layers the profile stubs.

const unavailable = (method: string) => () => {
  throw new Error(`node:fs shim: ${method} is not available in the browser runtime (no execution plane)`)
}

export const readFile = unavailable("readFile")
export const writeFile = unavailable("writeFile")
export const appendFile = unavailable("appendFile")
export const unlink = unavailable("unlink")
export const mkdir = unavailable("mkdir")
export const rmdir = unavailable("rmdir")
export const rm = unavailable("rm")
export const readdir = unavailable("readdir")
export const stat = unavailable("stat")
export const lstat = unavailable("lstat")
export const rename = unavailable("rename")
export const copyFile = unavailable("copyFile")
export const chmod = unavailable("chmod")
export const access = unavailable("access")
export const open = unavailable("open")
export const watch = unavailable("watch")
export const createReadStream = unavailable("createReadStream")
export const createWriteStream = unavailable("createWriteStream")
export const realpath = unavailable("realpath")

export const existsSync = () => false
export const statSync = unavailable("statSync")
export const readFileSync = unavailable("readFileSync")
export const writeFileSync = unavailable("writeFileSync")
export const readdirSync = unavailable("readdirSync")
export const mkdirSync = unavailable("mkdirSync")
export const rmSync = unavailable("rmSync")
export const unlinkSync = unavailable("unlinkSync")
export const renameSync = unavailable("renameSync")
export const realpathSync = unavailable("realpathSync")
export const lstatSync = unavailable("lstatSync")
export const openSync = unavailable("openSync")
export const closeSync = unavailable("closeSync")
export const readSync = unavailable("readSync")
export const writeSync = unavailable("writeSync")
export const chmodSync = unavailable("chmodSync")
export const accessSync = unavailable("accessSync")
export const exists = unavailable("exists")

export const constants = { F_OK: 0, R_OK: 4, W_OK: 2, X_OK: 1 }
export const promises = new Proxy({}, { get: (_target, method) => (method === "constants" ? constants : unavailable(String(method))) })
export const default_ = { ...{}, constants, promises }
export { default_ as default }
