/**
 * The `web` runtime variant. Browser SQLite starts on a fresh database (the
 * OPFS store is created by migrations itself), so the legacy v1 migration is a
 * no-op, matching workerd.
 */
export * as V1MigrationWeb from "./v1-migration.web"

export * from "./v1-migration.noop"
