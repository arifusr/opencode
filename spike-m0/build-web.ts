#!/usr/bin/env bun
/**
 * Builds the opencode web runtime bundle for the browser (M1 spike):
 * entry = the workerd-profile SDK booted with a fake DO storage and TestLLM,
 * wrapped in a minimal postMessage bridge. Node builtins resolve to the
 * hand-written shims under ./shims.
 *
 * Output: spike-m0/web/worker.js (+ index.html + driver) served by serve.ts.
 */
import path from "node:path"

const BUILTINS = new Map<string, string>(Object.entries({
  "node:path": "./shims/path.ts",
  "node:os": "./shims/os.ts",
  "node:util": "./shims/util.ts",
  "node:url": "./shims/url.ts",
  "node:crypto": "./shims/crypto.ts",
  "node:events": "./shims/events.ts",
  "node:async_hooks": "./shims/async-hooks.ts",
  "node:assert": "./shims/assert.ts",
  "node:process": "./shims/process.ts",
  "node:buffer": "./shims/buffer.ts",
  "node:stream": "./shims/stream.ts",
  "node:zlib": "./shims/zlib.ts",
  "node:querystring": "./shims/querystring.ts",
  "node:string_decoder": "./shims/string_decoder.ts",
  "node:constants": "./shims/constants.ts",
  "node:timers": "./shims/timers.ts",
  "node:punycode": "./shims/punycode.ts",
  "node:perf_hooks": "./shims/perf_hooks.ts",
  "node:fs": "./shims/fs.ts",
  "node:fs/promises": "./shims/fs-promises.ts",
  "node:child_process": "./shims/child-process.ts",
  "node:module": "./shims/module.ts",
  "node:worker_threads": "./shims/worker_threads.ts",
  "node:net": "./shims/net.ts",
  "node:tls": "./shims/tls.ts",
  "node:dns": "./shims/dns.ts",
  "node:http": "./shims/http.ts",
  "node:https": "./shims/https.ts",
  "node:http2": "./shims/http2.ts",
  "node:v8": "./shims/v8.ts",
  "node:tty": "./shims/tty.ts",
  "node:readline": "./shims/readline.ts",
  "node:trace_events": "./shims/trace_events.ts",
  "node:sys": "./shims/sys.ts",
}))
// Bare (non-node:) builtins resolve to the same shims.
const BARE = new Map([...BUILTINS].map(([spec, shim]) => [spec.replace(/^node:/, ""), shim]))

const matcher = /^(node:)?([a-z0-9_]+)(\/.*)?$/

const shimPlugin: BunPlugin = {
  name: "web-shim",
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      const match = matcher.exec(args.path)
      if (!match) return undefined
      const [, prefix, name, subpath] = match
      if (prefix !== "node:" && !BARE.has(name)) return undefined
      // fs/promises and similar subpaths get their own shim.
      const key = prefix === "node:" ? `node:${name}${subpath ?? ""}` : `${name}${subpath ?? ""}`
      const shim = key === "node:fs/promises" ? "./shims/fs-promises.ts" : (BUILTINS[key] ?? BARE.get(name + (subpath ?? "")) ?? BARE.get(name))
      if (!shim) return undefined
      return { path: path.resolve(import.meta.dir, shim), namespace: "file" }
    })
  },
}

const result = await Bun.build({
  entrypoints: [path.join(import.meta.dir, "worker-entry.ts")],
  conditions: ["web", "workerd"],
  target: "browser",
  outdir: path.join(import.meta.dir, "web"),
  sourcemap: "external",
  minify: true,
  plugins: [shimPlugin],
})

if (!result.success) {
  console.error(`web runtime build FAILED (${result.logs.length} issues)`)
  for (const log of result.logs) console.error(String(log))
  process.exit(1)
}
const bytes = result.outputs.reduce((total, artifact) => total + artifact.size, 0)
console.log(`web runtime build OK: ${result.outputs.length} artifacts, ${(bytes / 1024 / 1024).toFixed(1)} MB`)
