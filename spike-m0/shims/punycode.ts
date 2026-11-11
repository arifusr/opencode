// Browser shim for node:punycode — the platform URL parser handles IDN.
export const encode = (value: string) => value
export const decode = (value: string) => value
export const toUnicode = (value: string) => value
export const toASCII = (value: string) => value
export default { encode, decode, toUnicode, toASCII }
