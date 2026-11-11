/**
 * The `web` runtime variant. Reuses the workerd implementation: a browser has
 * no native fff binary, so workerd's stub search behavior is the correct web
 * behavior until the JS/WASM FileSystemSearch driver lands (FR-14).
 */
export * as FffWeb from "./fff.web"

export * from "./fff.workerd"
