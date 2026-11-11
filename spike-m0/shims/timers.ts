export const setTimeout = (callback: (...args: Array<any>) => void, delay?: number, ...args: Array<any>) => globalThis.setTimeout(callback, delay, ...args)
export const setInterval = (callback: (...args: Array<any>) => void, delay?: number, ...args: Array<any>) => globalThis.setInterval(callback, delay, ...args)
export const clearTimeout = (id: number) => globalThis.clearTimeout(id)
export const clearInterval = (id: number) => globalThis.clearInterval(id)
export const setImmediate = (callback: (...args: Array<any>) => void, ...args: Array<any>) => globalThis.setTimeout(callback, 0, ...args)
export const clearTimeoutImmediate = (id: number) => globalThis.clearTimeout(id)
export default { setTimeout, setInterval, clearTimeout, clearInterval, setImmediate }
