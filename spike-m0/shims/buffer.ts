// Browser shim for node:buffer — a minimal Buffer stand-in over Uint8Array,
// enough for identity checks and simple encoding used by reachable code.
class _Buffer extends Uint8Array {
  static from(input: string | Uint8Array | ArrayBuffer | Array<number>, encoding?: string) {
    if (typeof input === "string") {
      const bytes = new TextEncoder().encode(encoding === "base64" ? atob(input) : input)
      const out = new _Buffer(bytes.length)
      out.set(bytes)
      return out
    }
    const source = input instanceof Uint8Array ? input : new Uint8Array(input as ArrayBuffer)
    const out = new _Buffer(source.length)
    out.set(source)
    return out
  }
  static alloc(length: number, fill = 0) {
    const out = new _Buffer(length)
    out.fill(fill)
    return out
  }
  static allocUnsafe(length: number) {
    return new _Buffer(length)
  }
  static isBuffer(value: unknown) {
    return value instanceof Uint8Array
  }
  static concat(list: Array<Uint8Array>) {
    const total = list.reduce((sum, part) => sum + part.length, 0)
    const out = new _Buffer(total)
    let offset = 0
    for (const part of list) {
      out.set(part, offset)
      offset += part.length
    }
    return out
  }
  static byteLength(value: string | Uint8Array) {
    return typeof value === "string" ? new TextEncoder().encode(value).length : value.length
  }
  toString(encoding = "utf8") {
    const text = new TextDecoder().decode(this)
    return encoding === "base64" ? btoa(text) : text
  }
}
export const Buffer = _Buffer
export default _Buffer
export const kMaxLength = 0xffffffff
export const transcode = (input: Uint8Array) => input
