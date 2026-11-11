export const performance = globalThis.performance
export const monitorEventLoopDelay = () => {
  throw new Error("node:perf_hooks shim: monitorEventLoopDelay is not available in the browser runtime")
}
export const constants = { NODE_PERFORMANCE_GC_MAJOR: 1 }
export default { performance, monitorEventLoopDelay, constants }
