import { Link } from 'react-router-dom';
import { missions } from '../../content/missions';
import { useProgress } from '../progress/store';

export function MissionsListPage() {
  const missionState = useProgress((s) => s.missions);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Missions</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          Act in a role and solve a real business problem. SQL is the tool; the goal is to find the
          cause, recommend an action, and defend it. You finish with a report you can keep.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {missions.map((m) => {
          const rec = missionState[m.id];
          const solved = rec ? Object.keys(rec.stepsSolved).length : 0;
          const done = Boolean(rec?.completedAt);
          return (
            <li key={m.id}>
              <Link
                to={`/mission/${m.id}`}
                className="flex h-full flex-col rounded-xl border border-slate-200 p-5 hover:border-brand-400 dark:border-slate-800"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                  {m.role} · {m.company}
                </span>
                <h2 className="mt-1 text-lg font-semibold">{m.title}</h2>
                <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-300">
                  {m.context.slice(0, 140)}…
                </p>
                <span className="mt-3 text-sm text-slate-500">
                  {done ? 'Completed' : `${solved}/${m.steps.length} steps`}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-slate-500">
        More roles and companies will follow once this first mission is validated with real learners.
      </p>
    </div>
  );
}
