// Browser shim for node:url — the platform URL/URLSearchParams classes are the
// real implementation; only the file:// path conversion helpers need shimming,
// and the web runtime's virtual filesystem treats "/" as the workspace root.

export const URL = globalThis.URL
export const URLSearchParams = globalThis.URLSearchParams

const filePrefix = "file://"

export function fileURLToPath(url: string | URL): string {
  const value = typeof url === "string" ? url : url.href
  if (!value.startsWith(filePrefix)) throw new Error(`Cannot convert non-file URL to path: ${value}`)
  const path = decodeURIComponent(value.slice(filePrefix.length).split("?")[0])
  return path.startsWith("/") ? path : `/${path}`
}

export function pathToFileURL(path: string): URL {
  return new URL(`${filePrefix}${encodeURI(path)}`)
}

export function format(url: string | URL) {
  return typeof url === "string" ? url : url.href
}

export const domainToUnicode = (domain: string) => domain
export const domainToASCII = (domain: string) => domain

