// Browser shim for node:async_hooks — no async context machinery exists, so
// AsyncLocalStorage degrades to a no-op store (aisdk.ts only tracks
// context for tracing here).

export class AsyncLocalStorage {
  #store: unknown
  getStore() {
    return this.#store
  }
  run<R, TArgs extends Array<unknown>>(store: unknown, callback: (...args: TArgs) => R, ...args: TArgs): R {
    const previous = this.#store
    this.#store = store
    try {
      return callback(...args)
    } finally {
      this.#store = previous
    }
  }
  enterWith(store: unknown) {
    this.#store = store
  }
  exit<R, TArgs extends Array<unknown>>(callback: (...args: TArgs) => R, ...args: TArgs): R {
    const previous = this.#store
    this.#store = undefined
    try {
      return callback(...args)
    } finally {
      this.#store = previous
    }
  }
  disable() {
    this.#store = undefined
  }
}

export const createHook = () => ({ enable() {}, disable() {} })
export const executionAsyncId = () => 0
export const executionAsyncResource = () => ({})
export const triggerAsyncId = () => 0
export const asyncWrapProviders = {}
export default { AsyncLocalStorage, createHook, executionAsyncId, executionAsyncResource, triggerAsyncId }
