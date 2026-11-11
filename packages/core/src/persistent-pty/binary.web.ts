/**
 * The `web` runtime variant. Reuses the workerd implementation: a browser has
 * no process execution plane, so workerd's no-op behavior is the correct web
 * behavior until a dedicated browser implementation lands.
 */
export * as PersistentPtyBinaryWeb from "./binary.web"

export * from "./binary.workerd"
