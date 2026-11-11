/**
 * The `web` runtime sqlite driver. Browser runtimes have no Durable Object,
 * so the host supplies a `SqlStorage`-shaped backend (SQL cursor API: exec with
 * bindings, columnNames, raw()/toArray()) over sqlite WASM (sql.js, wa-sqlite
 * with an OPFS VFS, or a remote executor).
 *
 * The workerd adapter is structural — it only touches `DurableObjectStorage`'s
 * `sql.exec` and `transaction` methods — so the web condition reuses it
 * directly. Re-exporting keeps the two adapters from drifting while the browser
 * persistence backend is designed (see docs/requirements-web-runtime.md FR-22).
 */
export * as SqliteWeb from "./sqlite.web"

export {
  type DurableObjectStorage,
  type SqlStorage,
  supportsForeignKeyToggle,
  supportsTuningPragmas,
  sqliteLayer,
} from "./sqlite.workerd"
