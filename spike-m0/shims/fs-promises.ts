// Browser shim for node:fs/promises — see shims/fs.ts.

const unavailable = (method: string) => () => {
  throw new Error(`node:fs/promises shim: ${method} is not available in the browser runtime (no execution plane)`)
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
export const realpath = unavailable("realpath")
export const truncate = unavailable("truncate")
export const mkdtemp = unavailable("mkdtemp")
export const constants = { F_OK: 0, R_OK: 4, W_OK: 2, X_OK: 1 }
export default { readFile, writeFile, appendFile, unlink, mkdir, rmdir, rm, readdir, stat, lstat, rename, copyFile, chmod, access, open, watch, realpath, truncate, mkdtemp, constants }
