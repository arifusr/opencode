// Browser shim for node:process — the web runtime models a small virtual
// process; unknown env reads return undefined.
const env: Record<string, string | undefined> = {}
export const platform = "browser"
export const version = ""
export const versions = {}
export const arch = "wasm32"
export const argv = ["/opencode-web"]
export const cwd = () => "/"
export const nextTick = (callback: (...args: Array<any>) => void, ...args: Array<any>) =>
  Promise.resolve().then(() => callback(...args))
export const exit = (code = 0) => {
  throw new Error(`process.exit(${code}) called in the browser runtime`)
}
export const on = () => undefined
export const off = () => undefined
export const emit = () => false
export const once = () => undefined
export const hrtime = { bigint: () => BigInt(Math.round(performance.now() * 1e6)) }
export const memoryUsage = () => ({ rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 })
export default { env, platform, version, versions, arch, argv, cwd, nextTick, exit, on, off, emit, hrtime, memoryUsage }
