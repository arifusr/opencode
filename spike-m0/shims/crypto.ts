// Browser shim for node:crypto — WebCrypto-backed for the operations core uses
// statically (randomBytes, randomUUID, digests). Streaming ciphers/HMAC are
// call-time failures with a clear message instead of silent wrong results.

const subtle = () => globalThis.crypto.subtle

const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")

export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length)
  globalThis.crypto.getRandomValues(bytes)
  return bytes
}

export function randomUUID(): string {
  return globalThis.crypto.randomUUID()
}

export const randomFillSync = randomBytes
export const randomInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min))

type Algorithm = { name: string }

// Only "ready-made" one-shot digests are supported; `digest` returns a Buffer
// stand-in (a Uint8Array) because callers here hash for identity, not crypto.
export function createHash(algorithm: string) {
  const chunks: Array<Uint8Array> = []
  const digested = (async () => {
    const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const input = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) {
      input.set(chunk, offset)
      offset += chunk.length
    }
    const normalized = algorithm.toLowerCase().replace("-", "")
    const algo: Algorithm = normalized === "sha256" ? { name: "SHA-256" } : normalized === "sha512" ? { name: "SHA-512" } : normalized === "sha1" ? { name: "SHA-1" } : { name: "SHA-256" }
    return new Uint8Array(await subtle().digest(algo, input))
  })()
  return {
    update(data: Uint8Array | string, encoding?: string) {
      chunks.push(typeof data === "string" ? new TextEncoder().encode(data) : data)
      return this
    },
    digest: (encoding?: string) => digested.then((bytes) => (encoding === "hex" ? toHex(bytes) : bytes)),
  }
}

export const createHmac = (algorithm: string, key: unknown) => {
  throw new Error(`node:crypto shim: createHmac(${algorithm}) is not implemented in the browser runtime`)
}

export const createCipheriv = () => {
  throw new Error("node:crypto shim: createCipheriv is not implemented in the browser runtime")
}
export const createDecipheriv = () => {
  throw new Error("node:crypto shim: createDecipheriv is not implemented in the browser runtime")
}
export const pbkdf2Sync = () => {
  throw new Error("node:crypto shim: pbkdf2Sync is not implemented in the browser runtime")
}
export const scryptSync = () => {
  throw new Error("node:crypto shim: scryptSync is not implemented in the browser runtime")
}
export const timingSafeEqual = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

export const webcrypto = globalThis.crypto
export const getRandomValues = (array: Uint8Array) => globalThis.crypto.getRandomValues(array)
export default { randomBytes, randomUUID, createHash, webcrypto, timingSafeEqual }
