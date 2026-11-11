#!/usr/bin/env bun
/**
 * M0 web bundle probe (mirrors packages/server/script/workerd-probe.ts).
 *
 * Bundles the workerd profile entry with `target: "browser"` and prints every
 * surviving external. A `node:*` static import in a browser target is exactly
 * a service the runtime must supply (polyfill/external shim) — workerd provides
 * them through nodejs_compat, a browser does not. bun: static leaks are a hard
 * failure, same as the workerd probe.
 *
 * Usage: bun spike/m0/web-probe.ts [entry.ts]
 */
import path from "node:path"
import { mkdtempSync } from "node:fs"
import os from "node:os"

const REPO = path.resolve(import.meta.dir, "../../opencode")
const entry = process.argv[2] ?? path.join(REPO, "packages/server/src/workerd.ts")
const outdir = mkdtempSync(path.join(os.tmpdir(), "opencode-web-probe-"))
const result = await Bun.build({
  entrypoints: [entry],
  conditions: ["workerd"],
  target: "browser",
  outdir,
  sourcemap: "none",
  throw: false,
})

if (!result.success) {
  console.error(`web bundle probe FAILED (${result.logs.length} issues)`)
  const seen = new Set<string>()
  for (const log of result.logs) {
    const loc = (log as { location?: { file?: string; line?: number; column?: number } }).location
    const detail = loc?.file ? ` <- ${loc.file}${loc.line ? `:${loc.line}` : ""}` : ""
    const line = `${(log as { name?: string }).name ?? "Issue"}: ${(log as { message?: string }).message ?? ""}${detail}`
    if (!seen.has(line)) {
      seen.add(line)
      console.error(line)
    }
  }
  process.exit(1)
}

const transpiler = new Bun.Transpiler({ loader: "js" })
const externals = new Map<string, { static: boolean }>()
const record = (specifier: string, isStatic: boolean) => {
  const seen = externals.get(specifier)
  externals.set(specifier, { static: (seen?.static ?? false) || isStatic })
}
for (const artifact of result.outputs) {
  const text = await artifact.text()
  for (const imported of transpiler.scanImports(text)) record(imported.path, imported.kind !== "dynamic-import")
  for (const match of text.matchAll(/\brequire\(\s*"([^"]+)"\s*\)/g)) record(match[1], true)
}
const sorted = Array.from(externals.keys()).toSorted()
const isBun = (specifier: string) => specifier === "bun" || specifier.startsWith("bun:")
const leaked = sorted.filter((specifier) => isBun(specifier) && externals.get(specifier)!.static)
const nodeExternals = sorted.filter((specifier) => specifier.startsWith("node:"))
const bytes = result.outputs.reduce((total, artifact) => total + artifact.size, 0)

console.log(`web bundle probe OK: ${result.outputs.length} artifacts, ${(bytes / 1024 / 1024).toFixed(1)} MiB`)
console.log(`node externals required by the runtime (${nodeExternals.length}):`)
for (const specifier of nodeExternals) {
  const lazy = externals.get(specifier)!.static ? " (static)" : " (lazy)"
  console.log(`  ${specifier}${lazy}`)
}
console.log(`other externals (${sorted.length - nodeExternals.length}):`)
for (const specifier of sorted) {
  if (specifier.startsWith("node:")) continue
  console.log(`  ${specifier}${externals.get(specifier)!.static ? "" : " (lazy)"}`)
}
if (leaked.length > 0) {
  console.error(`FAILED: bun builtins statically imported in the browser-target graph: ${leaked.join(", ")}`)
  process.exit(1)
}
