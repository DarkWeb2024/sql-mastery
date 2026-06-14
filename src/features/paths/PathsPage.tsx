import { Link } from 'react-router-dom';
import { tracks } from '../../content/tracks';
import { getTopic } from '../../content/topics';
import { useProgress } from '../progress/store';

export function PathsPage() {
  const completed = useProgress((s) => s.completedTopics);
  const solved = useProgress((s) => s.solved);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Learning paths</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          Ordered routes through the SQL topics, grouped by where you want to end up.
        </p>
      </header>

      {tracks.map((track) => {
        const topics = track.topicIds.map(getTopic).filter(Boolean);
        const done = topics.filter((t) => t && completed[t.id]).length;
        return (
          <section key={track.id} className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">{track.title}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{track.description}</p>
              </div>
              <span className="text-sm text-slate-500">
                {done}/{topics.length} topics complete
              </span>
            </div>

            <ol className="mt-4 space-y-2">
              {topics.map((t, i) => {
                if (!t) return null;
                const isDone = Boolean(completed[t.id]);
                const solvedInTopic = t.practice.filter((q) => solved[q.id]).length;
                const inner = (
                  <div
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      t.comingSoon
                        ? 'border-dashed border-slate-300 text-slate-400 dark:border-slate-700'
                        : 'border-slate-200 hover:border-brand-400 dark:border-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-200 text-xs font-semibold dark:bg-slate-700">
                        {i + 1}
                      </span>
                      <span className="font-medium">{t.title}</span>
                    </span>
                    <span className="text-xs text-slate-500">
                      {t.comingSoon
                        ? 'coming soon'
                        : isDone
                          ? 'complete'
                          : `${solvedInTopic}/${t.practice.length}`}
                    </span>
                  </div>
                );
                return (
                  <li key={t.id}>
                    {t.comingSoon ? inner : <Link to={`/topic/${t.id}`}>{inner}</Link>}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
