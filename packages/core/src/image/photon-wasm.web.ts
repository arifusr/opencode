/**
 * The `web` runtime variant. Reuses the workerd implementation: photon-wasm is
 * pure WASM and the workerd variant loads it without native bindings, which is
 * exactly what a browser needs.
 */
export * as PhotonWasmWeb from "./photon-wasm.web"

export * from "./photon-wasm.workerd"
