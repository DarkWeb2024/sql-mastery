import initSqlJs from 'sql.js';
// Vite resolves this to a served URL for the WebAssembly binary.
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import type { ResultSet } from '../types';

// sql.js uses an `export =` style, so we derive its types from the default
// export rather than importing named types that are not exposed that way.
type SqlJsStatic = Awaited<ReturnType<typeof initSqlJs>>;
type Database = InstanceType<SqlJsStatic['Database']>;

let sqlPromise: Promise<SqlJsStatic> | null = null;

// Load the sql.js runtime once and reuse it for every database we build.
function getSql(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({ locateFile: () => wasmUrl });
  }
  return sqlPromise;
}

// Cache one database per dataset seed so repeated runs against the same data
// do not pay the setup cost again.
const dbCache = new Map<string, Database>();

export async function getDatabase(datasetId: string, seedSql: string): Promise<Database> {
  const cached = dbCache.get(datasetId);
  if (cached) return cached;
  const SQL = await getSql();
  const db = new SQL.Database();
  db.run(seedSql);
  dbCache.set(datasetId, db);
  return db;
}

export interface QueryOutcome {
  ok: boolean;
  result?: ResultSet;
  error?: string;
}

// Runs a query and returns the final result set. Multiple statements are
// allowed; the last statement that produces columns is the one we show, which
// matches how learners expect a script to behave.
export async function runQuery(
  datasetId: string,
  seedSql: string,
  query: string
): Promise<QueryOutcome> {
  let db: Database;
  try {
    db = await getDatabase(datasetId, seedSql);
  } catch (err) {
    return { ok: false, error: `Could not start the SQL engine: ${asMessage(err)}` };
  }

  try {
    const statements = db.exec(query);
    if (statements.length === 0) {
      // A statement that returns no rows (for example an empty SELECT) is still
      // a successful run; show an empty grid rather than an error.
      return { ok: true, result: { columns: [], rows: [] } };
    }
    const last = statements[statements.length - 1];
    return {
      ok: true,
      result: { columns: last.columns, rows: last.values },
    };
  } catch (err) {
    return { ok: false, error: asMessage(err) };
  }
}

function asMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

// Reset is a no-op on the data itself because every dataset is seeded fresh and
// our practice queries are read-only, but exposing it lets the playground drop
// a cached database if we ever introduce write exercises.
export function resetDatabase(datasetId: string): void {
  const db = dbCache.get(datasetId);
  if (db) {
    db.close();
    dbCache.delete(datasetId);
  }
}
