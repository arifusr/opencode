// Browser shim for node:path — posix-only implementation (the web runtime's
// virtual filesystem is POSIX-shaped; there is no win32 execution plane).

const sep = "/"
const delimiter = ":"

const normalize = (value: string): string => {
  const isAbsolute = value.startsWith("/")
  const parts = value.split("/").filter((part) => part.length > 0 && part !== ".")
  const out: Array<string> = []
  for (const part of parts) {
    if (part === "..") {
      if (out.length > 0 && out[out.length - 1] !== "..") out.pop()
      else if (!isAbsolute) out.push("..")
      continue
    }
    out.push(part)
  }
  return (isAbsolute ? "/" : "") + out.join("/")
}

const join = (...parts: Array<string>) => {
  const joined = parts.filter((part) => typeof part === "string" && part.length > 0).join("/")
  return normalize(joined.length > 0 ? joined : ".")
}

const resolve = (...parts: Array<string>) => {
  let resolved = ""
  for (const part of parts) {
    if (typeof part !== "string" || part.length === 0) continue
    if (part.startsWith("/")) resolved = part
    else resolved = resolved ? `${resolved}/${part}` : part
  }
  resolved = normalize(resolved || ".")
  return resolved.startsWith("/") ? resolved : `/${resolved}`
}

const isAbsolute = (value: string) => typeof value === "string" && value.startsWith("/")

const dirname = (value: string) => {
  const normalized = normalize(value)
  const index = normalized.lastIndexOf("/")
  if (index <= 0) return index === 0 ? "/" : "."
  return normalized.slice(0, index)
}

const basename = (value: string, ext?: string) => {
  const normalized = normalize(value)
  const name = normalized.slice(normalized.lastIndexOf("/") + 1) || "/"
  if (ext && name.endsWith(ext) && name !== ext) return name.slice(0, -ext.length)
  return name
}

const extname = (value: string) => {
  const name = basename(value)
  const dot = name.lastIndexOf(".")
  if (dot <= 0) return ""
  return name.slice(dot)
}

const relative = (from: string, to: string) => {
  const fromParts = resolve(from).split("/").filter(Boolean)
  const toParts = resolve(to).split("/").filter(Boolean)
  let shared = 0
  while (shared < fromParts.length && shared < toParts.length && fromParts[shared] === toParts[shared]) shared++
  const up = fromParts.length - shared
  const back = Array.from({ length: up }, () => "..")
  return [...back, ...toParts.slice(shared)].join("/") || "."
}

const parse = (value: string) => ({
  root: isAbsolute(value) ? "/" : "",
  dir: dirname(value),
  base: basename(value),
  ext: extname(value),
  name: basename(value, extname(value)),
})

const format = (input: { root?: string; dir?: string; base?: string; ext?: string; name?: string }) => {
  if (input.dir === input.root) return `${input.dir}${input.base}`
  const dir = input.dir ?? input.root
  return dir ? join(dir, input.base) : `${input.name ?? ""}${input.ext ?? ""}`
}

const posix = { sep, delimiter, normalize, join, resolve, isAbsolute, dirname, basename, extname, relative, parse, format }

const win32 = { ...posix, sep: "\\", delimiter: ";" }

export { sep, delimiter, normalize, join, resolve, isAbsolute, dirname, basename, extname, relative, parse, format, posix, win32, posix as default }
