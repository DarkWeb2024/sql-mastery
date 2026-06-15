import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../progress/store';
import { buildLearnerGraph, recommendConcept, concepts } from '../../lib/knowledgeGraph';
import { MODES, recommendMode, selectSmartQuestions, type LearningMode } from '../../lib/adaptive';
import { getTopic } from '../../content/topics';

export function LearnPage() {
  const attempts = useProgress((s) => s.attempts);
  const solved = useProgress((s) => s.solved);
  const storedMode = useProgress((s) => s.mode);
  const setMode = useProgress((s) => s.setMode);

  const graph = useMemo(() => buildLearnerGraph(attempts, solved), [attempts, solved]);
  const suggestedMode = useMemo(() => recommendMode(graph), [graph]);
  const mode: LearningMode = storedMode ?? suggestedMode;

  const nextConceptId = useMemo(() => recommendConcept(graph), [graph]);
  const nextConcept = nextConceptId ? concepts.find((c) => c.id === nextConceptId) : null;

  const queue = useMemo(
    () => selectSmartQuestions(mode, graph, solved, 12),
    [mode, graph, solved]
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Smart Practice</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          A session built for you right now, drawing on what you have mastered, what is fading, and
          what you are ready to learn next.
        </p>
      </header>

      {nextConcept && (
        <section className="rounded-xl border border-brand-300 bg-brand-50 p-4 dark:border-brand-700 dark:bg-brand-950/30">
          <p className="text-sm text-slate-600 dark:text-slate-300">Recommended focus</p>
          <p className="mt-1 text-lg font-semibold">{nextConcept.title}</p>
          <Link
            to={`/topic/${nextConcept.id}`}
            className="mt-2 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Open lesson
          </Link>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Choose how you want to train</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {MODES.map((m) => {
            const active = m.id === mode;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                aria-pressed={active}
                className={`rounded-xl border p-3 text-left ${
                  active
                    ? 'border-brand-500 bg-brand-50 dark:border-brand-600 dark:bg-brand-950/40'
                    : 'border-slate-200 hover:border-brand-400 dark:border-slate-800'
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="font-semibold">{m.title}</span>
                  {m.id === suggestedMode && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                      suggested
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{m.blurb}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Your session</h2>
        {queue.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nothing queued for this mode right now. Try another mode, or you may have cleared
            everything available, in which case unlock more by mastering earlier concepts.
          </p>
        ) : (
          <ol className="space-y-2">
            {queue.map((item, i) => {
              const topic = getTopic(item.topicId);
              return (
                <li key={item.q.id}>
                  <Link
                    to={`/practice/${item.topicId}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:border-brand-400 dark:border-slate-800"
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-200 text-xs font-semibold dark:bg-slate-700">
                        {i + 1}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{item.q.statement}</span>
                        <span className="block text-xs text-slate-500">
                          {topic?.title} · {item.q.difficulty}
                          {solved[item.q.id] ? ' · solved' : ''}
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
