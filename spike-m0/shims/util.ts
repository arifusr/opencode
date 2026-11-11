// Browser shim for node:util — format/inspect render with JSON instead of
// util's internal formatter; callback-style helpers keep signatures compatible.

const quote = (value: string) => `'${value}'`

export function inspect(value: unknown): string {
  if (typeof value === "string") return quote(value)
  if (value === null || typeof value !== "object") return String(value)
  if (Array.isArray(value)) return `[ ${value.map((item) => inspect(item)).join(", ")} ]`
  try {
    return `{ ${Object.entries(value as object).map(([key, item]) => `${key}: ${inspect(item)}`).join(", ")} }`
  } catch {
    return String(value)
  }
}

export function format(template: unknown, ...args: Array<unknown>): string {
  if (typeof template !== "string") return [template, ...args].map(inspect).join(" ")
  let index = 0
  let out = ""
  let rest = 0
  for (; index < template.length; index++) {
    const char = template[index]
    if (char !== "%" || index === template.length - 1) {
      out += char
      continue
    }
    const next = template[++index]
    if (next === "s") out += typeof args[rest] === "string" ? String(args[rest++]) : inspect(args[rest++])
    else if (next === "d" || next === "i" || next === "u") out += String(Number(args[rest++]))
    else if (next === "f") out += String(Number(args[rest++]))
    else if (next === "j") out += JSON.stringify(args[rest++])
    else if (next === "%") out += "%"
    else out += `%${next}`
  }
  for (; rest < args.length; rest++) out += (out.endsWith(" ") ? "" : " ") + inspect(args[rest])
  return out
}

export function promisify<TArgs extends Array<unknown>, TResult>(
  fn: (...args: [...TArgs, (error: unknown, result: TResult) => void]) => void,
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) =>
    new Promise<TResult>((resolve, reject) => {
      fn(...args, (error: unknown, result: TResult) => (error ? reject(error) : resolve(result)))
    })
}

export const callbackify =
  (fn: (...args: Array<any>) => Promise<any>) =>
  (...args: Array<any>) => {
    const callback = args.pop()
    fn(...args).then((result: any) => callback(null, result), (error: unknown) => callback(error))
  }

export const inherits = (ctor: Function, superCtor: Function) => {
  Object.setPrototypeOf(ctor.prototype, superCtor.prototype)
}
export const deprecate = <T extends (...args: Array<any>) => any>(fn: T): T => fn
export const debuglog = () => () => undefined
export const types = new Proxy({}, { get: () => () => false })
export const isArray = Array.isArray
export const isBoolean = (value: unknown) => typeof value === "boolean"
export const isNull = (value: unknown) => value === null
export const isNullOrUndefined = (value: unknown) => value === null || value === undefined
export const isNumber = (value: unknown) => typeof value === "number"
export const isString = (value: unknown) => typeof value === "string"
export const isSymbol = (value: unknown) => typeof value === "symbol"
export const isUndefined = (value: unknown) => value === undefined
export const isObject = (value: unknown) => typeof value === "object" && value !== null
export const isError = (value: unknown) => value instanceof Error
export const isFunction = (value: unknown) => typeof value === "function"
export const isPrimitive = (value: unknown) => typeof value !== "object" && typeof value !== "function"
export const isBuffer = (value: unknown) => false
export const isDate = (value: unknown) => value instanceof Date
export const isRegExp = (value: unknown) => value instanceof RegExp

export const TextEncoder = globalThis.TextEncoder
export const TextDecoder = globalThis.TextDecoder
export const nop = () => undefined

export default { format, inspect, promisify, inherits, deprecate, types }
