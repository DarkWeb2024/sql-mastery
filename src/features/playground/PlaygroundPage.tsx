import { useState } from 'react';
import { SqlEditor } from '../../components/SqlEditor';
import { ResultGrid } from '../../components/ResultGrid';
import { SchemaPanel } from '../../components/SchemaPanel';
import { getDataset } from '../../content/datasets/company';
import { runQuery, type QueryOutcome } from '../../lib/sqlEngine';

const STARTER_QUERY = 'SELECT name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 5;';

export function PlaygroundPage() {
  const dataset = getDataset('company');
  const [query, setQuery] = useState(STARTER_QUERY);
  const [outcome, setOutcome] = useState<QueryOutcome | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    const result = await runQuery(dataset.id, dataset.seedSql, query);
    setOutcome(result);
    setRunning(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">SQL Playground</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Write and run SQL against the <span className="font-mono">{dataset.title}</span> dataset.
          Everything executes in your browser. Press <kbd className="rounded border px-1">Ctrl</kbd>
          /<kbd className="rounded border px-1">Cmd</kbd> + <kbd className="rounded border px-1">Enter</kbd> to run.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          <SqlEditor value={query} onChange={setQuery} onRun={run} height={220} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={run}
              disabled={running}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {running ? 'Running…' : 'Run query'}
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery(STARTER_QUERY);
                setOutcome(null);
              }}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Reset
            </button>
          </div>
          <ResultGrid result={outcome?.result ?? null} error={outcome && !outcome.ok ? outcome.error : undefined} />
        </div>

        <aside className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <SchemaPanel
            datasetId={dataset.id}
            onPreview={(sql) => {
              setQuery(sql);
            }}
          />
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Click a table to load a preview query.
          </p>
        </aside>
      </div>
    </div>
  );
}
