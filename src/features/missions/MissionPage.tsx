import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMission } from '../../content/missions';
import type { MissionStep } from '../../content/missions/types';
import { getDataset } from '../../content/datasets';
import { getPattern } from '../../content/patterns';
import { thinkingTags } from '../../content/thinking';
import { SqlEditor } from '../../components/SqlEditor';
import { ResultGrid } from '../../components/ResultGrid';
import { SchemaPanel } from '../../components/SchemaPanel';
import { runQuery } from '../../lib/sqlEngine';
import { compareResults } from '../../lib/validate';
import { buildMissionArtifact, downloadArtifact } from '../../lib/artifact';
import { useProgress, emptyMissionRecord } from '../progress/store';
import type { ResultSet } from '../../types';

export function MissionPage() {
  const { id = '' } = useParams();
  const mission = getMission(id);

  const record = useProgress((s) => s.missions[id]) ?? emptyMissionRecord();
  const solveMissionStep = useProgress((s) => s.solveMissionStep);
  const updateMission = useProgress((s) => s.updateMission);
  const completeMission = useProgress((s) => s.completeMission);

  if (!mission) {
    return (
      <div className="space-y-3">
        <p>That mission does not exist.</p>
        <Link to="/missions" className="text-brand-600 hover:underline">
          Back to missions
        </Link>
      </div>
    );
  }

  const solvedCount = mission.steps.filter((s) => record.stepsSolved[s.id]).length;
  const allSolved = solvedCount === mission.steps.length;

  const conf = record.confidence;
  const refl = record.reflection;

  function exportArtifact() {
    if (!mission) return;
    completeMission(mission.id);
    const latest = useProgress.getState().missions[mission.id] ?? record;
    downloadArtifact(`${mission.id}-report.md`, buildMissionArtifact(mission, latest));
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
          Mission · {mission.role} · {mission.company}
        </p>
        <h1 className="text-2xl font-bold">{mission.title}</h1>
        <p className="text-slate-700 dark:text-slate-300">{mission.context}</p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {mission.patternIds.map((pid) => {
            const p = getPattern(pid);
            return p ? (
              <span key={pid} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                {p.title}
              </span>
            ) : null;
          })}
          {mission.thinkingTags.map((t) => (
            <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {thinkingTags[t].label}
            </span>
          ))}
        </div>
      </header>

      <details className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <summary className="cursor-pointer text-sm font-medium">Dataset reference</summary>
        <div className="mt-3">
          <SchemaPanel datasetId={mission.steps[0].datasetId} />
        </div>
      </details>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Investigation ({solvedCount}/{mission.steps.length})
        </h2>
        {mission.steps.map((step, i) => (
          <StepCard
            key={step.id}
            index={i + 1}
            step={step}
            solved={Boolean(record.stepsSolved[step.id])}
            onSolved={() => solveMissionStep(mission.id, step.id)}
          />
        ))}
      </section>

      {!allSolved ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
          Solve every investigation step to unlock the decision, calibration, and reflection phases.
          Reading is not enough; the analysis has to actually run.
        </p>
      ) : (
        <>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Decision</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{mission.decisionPrompt}</p>
            <textarea
              value={record.recommendation}
              onChange={(e) => updateMission(mission.id, { recommendation: e.target.value })}
              placeholder="State the cause, your recommended first action, and the reasoning that links them."
              className="h-32 w-full rounded-md border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Confidence calibration</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Professionals are paid to decide under uncertainty. Calibrate, do not guess.
            </p>
            <label className="block text-sm">
              How confident are you? <span className="font-mono">{conf.level}%</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={conf.level}
                onChange={(e) => updateMission(mission.id, { confidence: { ...conf, level: Number(e.target.value) } })}
                className="mt-1 w-full"
              />
            </label>
            <Field label="What evidence supports that confidence?" value={conf.supporting} onChange={(v) => updateMission(mission.id, { confidence: { ...conf, supporting: v } })} />
            <Field label="What evidence would change your mind?" value={conf.wouldChange} onChange={(v) => updateMission(mission.id, { confidence: { ...conf, wouldChange: v } })} />
            <Field label="What is your most fragile assumption?" value={conf.fragileAssumption} onChange={(v) => updateMission(mission.id, { confidence: { ...conf, fragileAssumption: v } })} />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Reflection</h2>
            <Field label="Why did you choose this approach?" value={refl.whyApproach} onChange={(v) => updateMission(mission.id, { reflection: { ...refl, whyApproach: v } })} />
            <Field label="What alternatives did you consider?" value={refl.alternatives} onChange={(v) => updateMission(mission.id, { reflection: { ...refl, alternatives: v } })} />
            <Field label="What assumptions did you make?" value={refl.assumptions} onChange={(v) => updateMission(mission.id, { reflection: { ...refl, assumptions: v } })} />
            <Field label="What would you do if the data changed?" value={refl.ifDataChanged} onChange={(v) => updateMission(mission.id, { reflection: { ...refl, ifDataChanged: v } })} />
          </section>

          <section className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-950/30">
            <h2 className="text-lg font-semibold">Portfolio artifact</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Export your investigation, decision, and reasoning as a Markdown report you can keep and
              show. This is evidence of how you think, not a completion badge.
            </p>
            <button
              type="button"
              onClick={exportArtifact}
              disabled={!record.recommendation.trim()}
              className="mt-3 rounded-md bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              Export report
            </button>
            {!record.recommendation.trim() && (
              <p className="mt-2 text-xs text-slate-500">Write your recommendation first.</p>
            )}
            {record.completedAt && (
              <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
                Mission complete. You can refine your answers and export again any time.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-20 w-full rounded-md border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
      />
    </label>
  );
}

function StepCard({
  index,
  step,
  solved,
  onSolved,
}: {
  index: number;
  step: MissionStep;
  solved: boolean;
  onSolved: () => void;
}) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<ResultSet | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [correct, setCorrect] = useState(solved);
  const [showHint, setShowHint] = useState(false);
  const [running, setRunning] = useState(false);

  async function check() {
    setRunning(true);
    setError(undefined);
    const dataset = getDataset(step.datasetId);
    const user = await runQuery(dataset.id, dataset.seedSql, query);
    if (!user.ok || !user.result) {
      setResult(null);
      setError(user.error ?? 'Query failed.');
      setRunning(false);
      return;
    }
    setResult(user.result);
    const expected = await runQuery(dataset.id, dataset.seedSql, step.solution);
    if (expected.ok && expected.result && compareResults(expected.result, user.result, step.orderMatters).correct) {
      setCorrect(true);
      onSolved();
    } else {
      setCorrect(false);
      setError(undefined);
    }
    setRunning(false);
  }

  return (
    <div className={`rounded-lg border p-3 ${correct ? 'border-emerald-300 dark:border-emerald-700' : 'border-slate-200 dark:border-slate-800'}`}>
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-200 text-xs font-semibold dark:bg-slate-700">
          {index}
        </span>
        <span className="text-xs uppercase tracking-wide text-slate-400">{step.kind}</span>
        {correct && <span className="ml-auto text-sm text-emerald-600 dark:text-emerald-300">solved</span>}
      </div>
      <p className="mt-2 font-medium">{step.prompt}</p>

      <div className="mt-2">
        <SqlEditor value={query} onChange={setQuery} onRun={check} height={120} />
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
        {step.hint && (
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {showHint ? 'Hide hint' : 'Hint'}
          </button>
        )}
      </div>
      {showHint && step.hint && (
        <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {step.hint}
        </p>
      )}
      {result && (
        <div className="mt-2">
          <ResultGrid result={result} error={error} />
        </div>
      )}
      {error && !result && <div className="mt-2"><ResultGrid result={null} error={error} /></div>}
      {correct && (
        <p className="mt-2 rounded-md bg-emerald-50 p-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          {step.insight}
        </p>
      )}
    </div>
  );
}
