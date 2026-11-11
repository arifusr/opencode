// Browser shim for node:http — HTTP server APIs have no execution plane.
// Global fetch is the browser's real HTTP client (model transport FR-18).
import NoPlane from "./no-plane"
export const createServer = () => {
  throw new Error("node:http shim: createServer is not available in the browser runtime")
}
export const request = () => {
  throw new Error("node:http shim: request is not available in the browser runtime (use fetch)")
}
export const get = () => {
  throw new Error("node:http shim: get is not available in the browser runtime (use fetch)")
}
export const Agent = NoPlane
export const STATUS_CODES = { 200: "OK", 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 429: "Too Many Requests", 500: "Internal Server Error" }
export default { createServer, request, get, Agent, STATUS_CODES }
