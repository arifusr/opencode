// Browser shims for socket/HTTP server-side Node modules — these exist only to
// keep statically-importing dependency code loadable; every use fails at call
// time. Browser LLM traffic goes through fetch and the injected model
// transport, and MCP stdio is unsupported on the web (FR-26).

const unavailable = (method: string) => () => {
  throw new Error(`${method} is not available in the browser runtime (no execution plane)`)
}

const socketShim = (name: string) => {
  const unavailable_ = unavailable(name)
  const throwing = new Proxy({}, { get: (_target, method) => (method === "then" ? undefined : unavailable_) })
  return throwing
}

export default socketShim
