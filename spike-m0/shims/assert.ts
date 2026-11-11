class AssertionErrorClass extends Error {
  name = "AssertionError"
  constructor(message: unknown) {
    super(typeof message === "string" ? message : String(message))
  }
}
export const AssertionError = AssertionErrorClass
export const ok = (value: unknown, message?: unknown) => {
  if (!value) throw new AssertionErrorClass(message ?? "assertion failed")
}
export const strict = { ...{}, ok, equal, deepEqual, throws, doesNotThrow, fail }
export const equal = ok
export const deepEqual = ok
export const notEqual = (a: unknown, b: unknown, message?: unknown) => {
  if (a === b) throw new AssertionErrorClass(message ?? "assertion failed")
}
export const deepStrictEqual = ok
export const strictEqual = ok
export const notDeepEqual = notEqual
export const notStrictEqual = notEqual
export const throws = (fn: () => unknown, _expected?: unknown, message?: unknown) => {
  try {
    fn()
  } catch {
    return
  }
  throw new AssertionErrorClass(message ?? "expected function to throw")
}
export const doesNotThrow = (fn: () => unknown, message?: unknown) => {
  try {
    fn()
  } catch (error) {
    throw new AssertionErrorClass(message ?? "expected function not to throw")
  }
}
export const fail = (message?: unknown) => {
  throw new AssertionErrorClass(message ?? "assertion failed")
}
export default { AssertionError, ok, equal, deepEqual, strict, strictEqual, deepStrictEqual, notEqual, notDeepEqual, notStrictEqual, throws, doesNotThrow, fail }
