export const parse = (value: string) => Object.fromEntries(new URLSearchParams(value))
export const stringify = (value: Record<string, string>) => new URLSearchParams(value).toString()
export const escape = encodeURIComponent
export const unescape = decodeURIComponent
export default { parse, stringify, escape, unescape }
