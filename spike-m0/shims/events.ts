// Browser shim for node:events — minimal EventEmitter.

export class EventEmitter {
  #handlers = new Map<string, Set<(...args: Array<any>) => void>>()
  on(event: string, handler: (...args: Array<any>) => void) {
    if (!this.#handlers.has(event)) this.#handlers.set(event, new Set())
    this.#handlers.get(event)!.add(handler)
    return this
  }
  addListener = EventEmitter.prototype.on
  once(event: string, handler: (...args: Array<any>) => void) {
    const wrapped = (...args: Array<any>) => {
      this.off(event, wrapped)
      handler(...args)
    }
    return this.on(event, wrapped)
  }
  off(event: string, handler: (...args: Array<any>) => void) {
    this.#handlers.get(event)?.delete(handler)
    return this
  }
  removeListener = EventEmitter.prototype.off
  removeAllListeners(event?: string) {
    if (event) this.#handlers.delete(event)
    else this.#handlers.clear()
    return this
  }
  emit(event: string, ...args: Array<any>) {
    const handlers = this.#handlers.get(event)
    if (!handlers) return false
    for (const handler of [...handlers]) handler(...args)
    return true
  }
  listenerCount(event: string) {
    return this.#handlers.get(event)?.size ?? 0
  }
  eventNames() {
    return [...this.#handlers.keys()]
  }
  listeners(event: string) {
    return [...(this.#handlers.get(event) ?? [])]
  }
  setMaxListeners() {
    return this
  }
  getMaxListeners() {
    return 10
  }
  prependListener = EventEmitter.prototype.on
  prependOnceListener = EventEmitter.prototype.once
}

export { EventEmitter as default }
export class EventTarget extends globalThis.EventTarget {}
export const captureRejections = false
export const defaultMaxListeners = 10
export const once = async (emitter: EventEmitter, event: string) => new Promise((resolve) => emitter.once(event, resolve))
export const getEventListeners = (emitter: EventEmitter, event: string) => emitter.listeners(event)
export const setMaxListeners = () => undefined
