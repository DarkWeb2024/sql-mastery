import { Link } from 'react-router-dom';
import { allTopics } from '../content/topics';
import { useProgress } from '../features/progress/store';

// A compact grid showing every topic and how far through its practice the
// learner is. Uses text and fill level, not colour alone, so it reads without
// relying on colour perception.
export function CompletionMap() {
  const solved = useProgress((s) => s.solved);
  const completed = useProgress((s) => s.completedTopics);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {allTopics.map((t) => {
        const total = t.practice.length;
        const done = t.practice.filter((q) => solved[q.id]).length;
        const ratio = total === 0 ? 0 : done / total;
        const isDone = Boolean(completed[t.id]);
        const cell = (
          <div
            className={`h-full rounded-lg border p-3 ${
              t.comingSoon
                ? 'border-dashed border-slate-300 text-slate-400 dark:border-slate-700'
                : isDone
                  ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <p className="text-sm font-medium">{t.title}</p>
            <p className="mt-1 text-xs text-slate-500">
              {t.comingSoon ? 'coming soon' : `${done}/${total} solved`}
            </p>
            {!t.comingSoon && (
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${Math.round(ratio * 100)}%` }}
                />
              </div>
            )}
          </div>
        );
        return t.comingSoon ? (
          <div key={t.id}>{cell}</div>
        ) : (
          <Link key={t.id} to={`/topic/${t.id}`} className="block">
            {cell}
          </Link>
        );
      })}
    </div>
  );
}
