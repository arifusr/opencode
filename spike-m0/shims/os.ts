// Browser shim for node:os — a browser has no host OS, so the values model the
// virtual workspace environment.

export const EOL = "\n"
export const arch = () => "wasm32"
export const platform = () => "browser"
export const tmpdir = () => "/tmp"
export const homedir = () => "/"
export const hostname = () => "browser"
export const type = () => "Browser"
export const release = () => "0.0.0-web"
export const uptime = () => Math.round(performance.now() / 1000)
export const cpus = () => Array.from({ length: navigator.hardwareConcurrency || 2 }, () => ({ model: "web", speed: 0, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } }))
export const totalmem = () => 0
export const freemem = () => 0
export const networkInterfaces = () => ({})
export const userInfo = () => ({ username: "web", homedir: "/", uid: -1, gid: -1, shell: null })
export const loadavg = () => [0, 0, 0]
export const endianness = () => "LE"
export const availableParallelism = () => navigator.hardwareConcurrency || 2
export default { EOL, arch, platform, tmpdir, homedir, hostname, type, release, uptime, cpus, totalmem, freemem, networkInterfaces, userInfo, loadavg, availableParallelism }
