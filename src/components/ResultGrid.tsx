import type { ResultSet } from '../types';

interface Props {
  result: ResultSet | null;
  error?: string;
}

// Renders a query result as a scrollable table, or the SQL error if one was
// returned. Kept presentational so both the playground and practice runner
// reuse it.
export function ResultGrid({ result, error }: Props) {
  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-3 font-mono text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
        Run a query to see results here.
      </div>
    );
  }

  if (result.columns.length === 0) {
    return (
      <div className="rounded-lg border border-slate-300 p-3 text-sm text-slate-500 dark:border-slate-700">
        The query ran successfully but returned no columns.
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>
            {result.columns.map((col, i) => (
              <th
                key={i}
                className="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, r) => (
            <tr key={r} className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900 dark:even:bg-slate-900/40">
              {row.map((cell, c) => (
                <td key={c} className="whitespace-nowrap px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300">
                  {cell === null ? <span className="italic text-slate-400">NULL</span> : String(cell)}
                </td>
              ))}
            </tr>
          ))}
          {result.rows.length === 0 && (
            <tr>
              <td
                colSpan={result.columns.length}
                className="px-3 py-3 text-center text-slate-500"
              >
                No rows.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
