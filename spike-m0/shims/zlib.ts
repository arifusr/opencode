// Browser shim for node:zlib — Compression Streams API is the real backend;
// only the one-shot helpers the runtime uses are implemented.
const decompress = async (data: Uint8Array, format: "gzip" | "deflate") => {
  const stream = new Blob([data as unknown as BlobPart]).stream().pipeThrough(new DecompressionStream(format))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}
export const gunzipSync = () => {
  throw new Error("node:zlib shim: sync gzip is not available (async only)")
}
export const gunzip = (data: Uint8Array) => Promise.resolve(decompress(data, "gzip"))
export const inflate = (data: Uint8Array) => Promise.resolve(decompress(data, "deflate"))
export const inflateSync = () => {
  throw new Error("node:zlib shim: sync inflate is not available (async only)")
}
export const unzip = (data: Uint8Array) => Promise.resolve(decompress(data, "deflate"))
export const gzip = async (data: Uint8Array) => {
  const stream = new Blob([data as unknown as BlobPart]).stream().pipeThrough(new CompressionStream("gzip"))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}
export const deflate = async (data: Uint8Array) => {
  const stream = new Blob([data as unknown as BlobPart]).stream().pipeThrough(new CompressionStream("deflate"))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}
export default { gunzip, gunzipSync, inflate, inflateSync, unzip, gzip, deflate }
