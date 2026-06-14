import { useEffect, useState } from 'react';
import { getDataset } from '../content/datasets/company';
import { runQuery } from '../lib/sqlEngine';

interface TableSchema {
  name: string;
  columns: string[];
}

interface Props {
  datasetId: string;
  // Optional callback so a parent (the playground) can show sample rows when a
  // table name is clicked.
  onPreview?: (sql: string) => void;
}

// Reads the live schema from the seeded database so the displayed columns are
// always exactly what the engine knows about, never a hand-maintained copy.
export function SchemaPanel({ datasetId, onPreview }: Props) {
  const [schema, setSchema] = useState<TableSchema[]>([]);

  useEffect(() => {
    let cancelled = false;
    const dataset = getDataset(datasetId);
    (async () => {
      const tables: TableSchema[] = [];
      for (const table of dataset.tables) {
        const outcome = await runQuery(datasetId, dataset.seedSql, `PRAGMA table_info(${table});`);
        const nameIndex = outcome.result?.columns.indexOf('name') ?? -1;
        const columns =
          outcome.ok && outcome.result && nameIndex >= 0
            ? outcome.result.rows.map((row) => String(row[nameIndex]))
            : [];
        tables.push({ name: table, columns });
      }
      if (!cancelled) setSchema(tables);
    })();
    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tables</h3>
      <ul className="space-y-2">
        {schema.map((table) => (
          <li key={table.name} className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onPreview?.(`SELECT * FROM ${table.name} LIMIT 5;`)}
              className="font-mono text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
              disabled={!onPreview}
            >
              {table.name}
            </button>
            <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
              {table.columns.join(', ')}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
