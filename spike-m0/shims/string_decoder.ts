export class StringDecoder {
  #decoder = new TextDecoder("utf-8")
  write = (buffer: Uint8Array) => this.#decoder.decode(buffer, { stream: true })
  end = (buffer?: Uint8Array) => this.#decoder.decode(buffer ? buffer : new Uint8Array())
}
export default { StringDecoder }
