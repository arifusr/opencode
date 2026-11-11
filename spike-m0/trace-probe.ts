#!/usr/bin/env bun
/**
 * M0 trace probe: bundles the workerd profile entry with target "browser",
 * shim-intercepting every Node builtin resolution and recording which module
 * imports it. Answers "what must the browser runtime shim, and where".
 */
import path from "node:path"

const REPO = path.resolve(import.meta.dir, "../../opencode")
const entry = process.argv[2] ?? path.join(REPO, "packages/server/src/workerd.ts")

// Builtins Bun refuses to bundle for target browser (observed in the plain probe)
const NODE_BUILTINS = new Set([
  "assert", "buffer", "child_process", "crypto", "dns", "events", "fs", "http", "http2",
  "https", "module", "net", "os", "path", "perf_hooks", "process", "querystring", "readline",
  "stream", "string_decoder", "timers", "tls", "tty", "url", "util", "v8", "worker_threads",
  "zlib", "async_hooks", "sys", "constants", "punycode", "trace_events",
])

const matcher = /^(node:)?([a-z0-9_]+)(\/.*)?$/

const importsBySpecifier = new Map<string, Map<string, { static: boolean; count: number }>>()

const builtinPlugin: BunPlugin = {
  name: "web-probe-builtin-shim",
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      const match = matcher.exec(args.path)
      if (!match) return undefined
      const [, prefix, name] = match
      if (prefix !== "node:" && !NODE_BUILTINS.has(name)) return undefined
      const spec = `node:${name}`
      let byImporter = importsBySpecifier.get(spec)
      if (!byImporter) importsBySpecifier.set(spec, (byImporter = new Map()))
      const entry = byImporter.get(args.importer) ?? { static: false, count: 0 }
      entry.count += 1
      if (args.kind !== "dynamic-import") entry.static = true
      byImporter.set(args.importer, entry)
      return {
        path: args.path,
        namespace: "web-probe-shim",
        pluginData: { specifier: spec },
      }
    })
    build.onLoad({ filter: /.*/, namespace: "web-probe-shim" }, (args) => {
      const name = matcher.exec(args.path)![2]
      return {
        contents: `export const SHIMMED = ${JSON.stringify(args.path)}; throw new Error("node builtin ${name} not shimmed for browser")`,
        loader: "js",
      }
    })
  },
}

const outdir = path.join(import.meta.dir, "out")
const result = await Bun.build({
  entrypoints: [entry],
  conditions: ["workerd"],
  target: "browser",
  outdir,
  sourcemap: "none",
  throw: false,
  plugins: [builtinPlugin],
})

console.log(result.success ? "trace build OK" : `trace build FAILED (${result.logs.length} issues)`)
if (!result.success) for (const log of result.logs) console.error(String(log))

const fileOf = (importer: string) => {
  // Bun installs into node_modules/.bun/<pkg>@<version>/node_modules/<pkg>/...
  const m = /node_modules\/\.bun\/([^/]+)\/node_modules\/((?:@[^/]+\/)?[^/]+)/.exec(importer)
  if (m) return `${m[2]} (${m[1]})`
  const m2 = /node_modules\/((?:@[^/]+\/)?[^/]+)/.exec(importer)
  if (m2) return m2[1]
  return importer.replace(REPO + "/", "")
}

for (const [spec, byImporter] of Array.from(importsBySpecifier.entries()).toSorted(([a], [b]) => a.localeCompare(b))) {
  console.log(`\n${spec}`)
  for (const [importer, { static: st, count }] of Array.from(byImporter.entries()).toSorted(([, a], [, b]) => b.count - a.count)) {
    console.log(`  ${st ? "static  " : "dynamic "} x${String(count).padStart(3)} ${fileOf(importer)}`)
  }
}
