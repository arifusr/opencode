// Browser shim for node:stream — the web runtime uses web streams; this keeps
// class extensions at module load working for reachable dependencies.
import { EventEmitter } from "./events"
export class Readable extends EventEmitter {
  pipe<T>(destination: T) {
    return destination
  }
  resume() {
    return this
  }
  pause() {
    return this
  }
}
export class Writable extends EventEmitter {}
export class Duplex extends Readable {}
export class Transform extends Duplex {}
export class PassThrough extends Transform {}
export const finished = () => Promise.resolve()
export const pipeline = () => {
  throw new Error("node:stream shim: pipeline is not available in the browser runtime")
}
export default { Readable, Writable, Duplex, Transform, PassThrough, finished, pipeline }
