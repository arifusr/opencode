// Browser shim for node:module — no CommonJS loader. Dynamic plugin loading
// uses ES module imports from allowlisted URLs (FR-28).
export const createRequire = () => {
  throw new Error("node:module shim: createRequire is not available in the browser runtime")
}
export const isBuiltin = (specifier: string) => specifier.startsWith("node:")
export const register = () => {
  throw new Error("node:module shim: register is not available in the browser runtime")
}
export default { createRequire, isBuiltin }
