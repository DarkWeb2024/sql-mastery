import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { getTopic } from '../../content/topics';
import { getDataset } from '../../content/datasets/company';
import { SqlEditor } from '../../components/SqlEditor';
import { ResultGrid } from '../../components/ResultGrid';
import { SchemaPanel } from '../../components/SchemaPanel';
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
  const drafts = useProgress((s) => s.drafts);
  const bookmarkedQuestions = useProgress((s) => s.bookmarkedQuestions);
  const recordSolve = useProgress((s) => s.recordSolve);
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const completeTopic = useProgress((s) => s.completeTopic);
  const setDraft = useProgress((s) => s.setDraft);
  const toggleBookmarkQuestion = useProgress((s) => s.toggleBookmarkQuestion);

  const questions = topic?.practice ?? [];
  const [activeId, setActiveId] = useState(questions[0]?.id ?? '');
  const active = questions.find((q) => q.id === activeId);

  const [query, setQuery] = useState('');
  const [resultRows, setResultRows] = useState<ResultSet | null>(null);
  const [feedback, setFeedback] = useState<Feedback>({ kind: 'idle' });
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [running, setRunning] = useState(false);

  // When the active question changes, restore any saved draft and reset state.
  useEffect(() => {
    setQuery(drafts[activeId] ?? '');
    setResultRows(null);
    setFeedback({ kind: 'idle' });
    setHintsShown(0);
    setShowSolution(false);
    // drafts intentionally omitted: we only want the draft for the question we
    // just switched to, not a re-run every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  function onQueryChange(value: string) {
    setQuery(value);
    if (active) setDraft(active.id, value);
  }

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
      recordAttempt(active.id, false);
      setFeedback({ kind: 'error', message: userOutcome.error ?? 'Query failed.' });
      setRunning(false);
      return;
    }
    setResultRows(userOutcome.result);

    const expectedOutcome = await runQuery(dataset.id, dataset.seedSql, active.solution);
    if (!expectedOutcome.ok || !expectedOutcome.result) {
      setFeedback({ kind: 'error', message: 'The reference solution failed to run. Please report this question.' });
      setRunning(false);
      return;
    }

    const comparison = compareResults(expectedOutcome.result, userOutcome.result, active.orderMatters);
    recordAttempt(active.id, comparison.correct);
    if (comparison.correct) {
      recordSolve(active.id, active.difficulty);
      const remaining = questions.filter((q) => q.id !== active.id && !solved[q.id]);
      if (remaining.length === 0) completeTopic(topic.id);
      setFeedback({ kind: 'correct' });
    } else {
      setFeedback({ kind: 'wrong', reason: comparison.reason ?? 'Not quite.' });
    }
    setRunning(false);
  }

  const isSolved = Boolean(solved[active.id]);
  const isBookmarked = Boolean(bookmarkedQuestions[active.id]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">Practice · {topic.title}</h1>
          <Link to={`/topic/${topic.id}`} className="text-sm text-brand-600 hover:underline">
            Back to the lesson
          </Link>
        </div>
        <div className="flex flex-wrap gap-1">
          {DIFFICULTY_ORDER.filter((d) => grouped.has(d)).flatMap((d) =>
            grouped.get(d)!.map((q, i) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setActiveId(q.id)}
                aria-current={q.id === activeId}
                title={`${d}: ${q.statement}`}
                className={`h-8 w-8 rounded-md text-xs font-semibold ${
                  q.id === activeId
                    ? 'bg-brand-600 text-white'
                    : solved[q.id]
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {d[0].toUpperCase()}
                {i + 1}
              </button>
            ))
          )}
        </div>
      </div>

      {/* IDE-style resizable layout. On small screens it stacks vertically. */}
      <div className="h-[640px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <PanelGroup direction="horizontal" autoSaveId="khwarizmi-practice-h">
          <Panel defaultSize={42} minSize={20} collapsible className="bg-white dark:bg-slate-900">
            <div className="h-full overflow-y-auto p-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium uppercase dark:bg-slate-800">
                  {active.difficulty}
                </span>
                {isSolved && (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                    solved
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleBookmarkQuestion(active.id)}
                  aria-pressed={isBookmarked}
                  className="ml-auto rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  {isBookmarked ? 'Saved' : 'Save'}
                </button>
              </div>

              <p className="mt-3 font-medium">{active.statement}</p>

              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Constraints
              </h3>
              <ul className="mt-1 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
                <li>Read-only query against the {active.datasetId} dataset.</li>
                {active.orderMatters && <li>Row order matters; sort as the task describes.</li>}
              </ul>

              <div className="mt-4">
                <SchemaPanel datasetId={active.datasetId} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setHintsShown((n) => Math.min(n + 1, active.hints.length))}
                  disabled={hintsShown >= active.hints.length}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Hint ({hintsShown}/{active.hints.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowSolution((v) => !v)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  {showSolution ? 'Hide solution' : 'Show solution'}
                </button>
              </div>

              {hintsShown > 0 && (
                <ul className="mt-3 list-disc space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 pl-8 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  {active.hints.slice(0, hintsShown).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}

              {showSolution && (
                <div className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-sm text-slate-100">
                    <code>{active.solution}</code>
                  </pre>
                  {active.notes && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{active.notes}</p>
                  )}
                </div>
              )}
            </div>
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-slate-200 transition-colors hover:bg-brand-400 dark:bg-slate-800" />

          <Panel defaultSize={58} minSize={30}>
            <PanelGroup direction="vertical" autoSaveId="khwarizmi-practice-v">
              <Panel defaultSize={55} minSize={20}>
                <div className="flex h-full flex-col p-3">
                  <div className="min-h-0 flex-1">
                    <SqlEditor value={query} onChange={onQueryChange} onRun={check} height="100%" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
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
                      onClick={() => onQueryChange('')}
                      className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      Clear
                    </button>
                    <span className="self-center text-xs text-slate-400">Draft saves automatically</span>
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-1.5 bg-slate-200 transition-colors hover:bg-brand-400 dark:bg-slate-800" />

              <Panel defaultSize={45} minSize={15} collapsible>
                <div className="h-full overflow-y-auto p-3">
                  {feedback.kind === 'correct' && (
                    <div className="mb-2 rounded-lg border border-emerald-300 bg-emerald-50 p-2 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                      Correct. {isSolved ? 'XP awarded.' : ''}
                    </div>
                  )}
                  {feedback.kind === 'wrong' && (
                    <div className="mb-2 rounded-lg border border-amber-300 bg-amber-50 p-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                      {feedback.reason}
                    </div>
                  )}
                  <ResultGrid
                    result={resultRows}
                    error={feedback.kind === 'error' ? feedback.message : undefined}
                  />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
