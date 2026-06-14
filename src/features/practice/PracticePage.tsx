import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTopic } from '../../content/topics';
import { getDataset } from '../../content/datasets/company';
import { SqlEditor } from '../../components/SqlEditor';
import { ResultGrid } from '../../components/ResultGrid';
import { runQuery } from '../../lib/sqlEngine';
import { compareResults } from '../../lib/validate';
import { useProgress } from '../../features/progress/store';
import type { Difficulty, PracticeQuestion, ResultSet } from '../../types';

const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];

type Feedback =
  | { kind: 'idle' }
  | { kind: 'error'; message: string }
  | { kind: 'wrong'; reason: string }
  | { kind: 'correct' };

export function PracticePage() {
  const { topicId = '' } = useParams();
  const topic = getTopic(topicId);
  const solved = useProgress((s) => s.solved);
  const recordSolve = useProgress((s) => s.recordSolve);
  const completeTopic = useProgress((s) => s.completeTopic);

  const questions = topic?.practice ?? [];
  const [activeId, setActiveId] = useState(questions[0]?.id ?? '');
  const active = questions.find((q) => q.id === activeId);

  const [query, setQuery] = useState('');
  const [resultRows, setResultRows] = useState<ResultSet | null>(null);
  const [feedback, setFeedback] = useState<Feedback>({ kind: 'idle' });
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [running, setRunning] = useState(false);

  // Reset the editor and feedback whenever the active question changes.
  useEffect(() => {
    setQuery('');
    setResultRows(null);
    setFeedback({ kind: 'idle' });
    setHintsShown(0);
    setShowSolution(false);
  }, [activeId]);

  const grouped = useMemo(() => {
    const map = new Map<Difficulty, PracticeQuestion[]>();
    for (const q of questions) {
      const list = map.get(q.difficulty) ?? [];
      list.push(q);
      map.set(q.difficulty, list);
    }
    return map;
  }, [questions]);

  if (!topic || !active) {
    return (
      <div className="space-y-3">
        <p>No practice is available for this topic yet.</p>
        <Link to="/" className="text-brand-600 hover:underline">
          Back to the roadmap
        </Link>
      </div>
    );
  }

  async function check() {
    if (!active || !topic) return;
    setRunning(true);
    setFeedback({ kind: 'idle' });
    const dataset = getDataset(active.datasetId);

    const userOutcome = await runQuery(dataset.id, dataset.seedSql, query);
    if (!userOutcome.ok || !userOutcome.result) {
      setResultRows(null);
      setFeedback({ kind: 'error', message: userOutcome.error ?? 'Query failed.' });
      setRunning(false);
      return;
    }
    setResultRows(userOutcome.result);

    // The expected answer is computed live from the canonical solution, so it is
    // always consistent with the current dataset.
    const expectedOutcome = await runQuery(dataset.id, dataset.seedSql, active.solution);
    if (!expectedOutcome.ok || !expectedOutcome.result) {
      setFeedback({ kind: 'error', message: 'The reference solution failed to run. Please report this question.' });
      setRunning(false);
      return;
    }

    const comparison = compareResults(expectedOutcome.result, userOutcome.result, active.orderMatters);
    if (comparison.correct) {
      recordSolve(active.id, active.difficulty);
      // Mark the topic complete once every question has been solved.
      const remaining = questions.filter((q) => q.id !== active.id && !solved[q.id]);
      if (remaining.length === 0) completeTopic(topic.id);
      setFeedback({ kind: 'correct' });
    } else {
      setFeedback({ kind: 'wrong', reason: comparison.reason ?? 'Not quite.' });
    }
    setRunning(false);
  }

  const isSolved = Boolean(solved[active.id]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Practice · {topic.title}</h1>
          <Link to={`/topic/${topic.id}`} className="text-sm text-brand-600 hover:underline">
            Back to the lesson
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          {DIFFICULTY_ORDER.filter((d) => grouped.has(d)).map((d) => (
            <div key={d}>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{d}</h3>
              <ul className="space-y-1">
                {grouped.get(d)!.map((q) => (
                  <li key={q.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(q.id)}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm ${
                        q.id === activeId
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{q.statement}</span>
                      {solved[q.id] && <span className="ml-2 text-emerald-600 dark:text-emerald-300">✓</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium uppercase dark:bg-slate-800">
                {active.difficulty}
              </span>
              {isSolved && (
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                  solved
                </span>
              )}
            </div>
            <p className="mt-2 font-medium">{active.statement}</p>
            <p className="mt-1 text-xs text-slate-500">
              Dataset: <span className="font-mono">{active.datasetId}</span>
            </p>
          </div>

          <SqlEditor value={query} onChange={setQuery} onRun={check} height={180} />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={check}
              disabled={running}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {running ? 'Checking…' : 'Run and check'}
            </button>
            <button
              type="button"
              onClick={() => setHintsShown((n) => Math.min(n + 1, active.hints.length))}
              disabled={hintsShown >= active.hints.length}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Hint ({hintsShown}/{active.hints.length})
            </button>
            <button
              type="button"
              onClick={() => setShowSolution((v) => !v)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {showSolution ? 'Hide solution' : 'Show solution'}
            </button>
          </div>

          {hintsShown > 0 && (
            <ul className="list-disc space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 pl-8 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {active.hints.slice(0, hintsShown).map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}

          {feedback.kind === 'correct' && (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              Correct. {isSolved ? 'XP awarded.' : ''}
            </div>
          )}
          {feedback.kind === 'wrong' && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              {feedback.reason}
            </div>
          )}

          {showSolution && (
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-sm text-slate-100">
                <code>{active.solution}</code>
              </pre>
              {active.notes && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{active.notes}</p>}
            </div>
          )}

          <div>
            <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Your result</h3>
            <ResultGrid
              result={resultRows}
              error={feedback.kind === 'error' ? feedback.message : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
