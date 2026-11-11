// Browser shim for node:child_process — no process execution plane. The
// CrossSpawnSpawner layer is replaced with EnvironmentUnavailable in the web
// profile; this shim keeps statically-importing modules loadable.

const unavailable = (method: string) => () => {
  throw new Error(`node:child_process shim: ${method} is not available in the browser runtime (no execution plane)`)
}

export const spawn = unavailable("spawn")
export const spawnSync = unavailable("spawnSync")
export const exec = unavailable("exec")
export const execSync = unavailable("execSync")
export const execFile = unavailable("execFile")
export const execFileSync = unavailable("execFileSync")
export const fork = unavailable("fork")
export default { spawn, spawnSync, exec, execSync, execFile, execFileSync, fork }
