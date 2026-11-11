// Browser shim for node:worker_threads — the agent already runs in a Worker;
// nested Worker machinery is not used by the web runtime.
export const isMainThread = true
export const threadId = 0
export const parentPort = undefined
export const workerData = undefined
export const MessageChannel = globalThis.MessageChannel
export const MessagePort = globalThis.MessagePort
export default { isMainThread, threadId, parentPort, workerData, MessageChannel }
