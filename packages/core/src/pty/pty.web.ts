/**
 * The `web` runtime pty stub: no process execution plane in a browser.
 * Reuses the workerd stub, which fails with a clear typed defect.
 */
export * as PtyWeb from "./pty.web"

export * from "./pty.workerd"
