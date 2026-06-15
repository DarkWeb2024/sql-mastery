import { useState } from 'react';
import { MentorPanel } from './MentorPanel';
import { useMentorProfile } from './useMentorProfile';
import { useProgress } from '../progress/store';
import { availableProviderIds } from '../../lib/ai';
import { generateQuestion } from '../../lib/ai/generate';
import type { PracticeQuestion } from '../../types';

export function MentorPage() {
  const aiConfig = useProgress((s) => s.aiConfig);
  const goal = useProgress((s) => s.goal);
  const setGoal = useProgress((s) => s.setGoal);
  const profile = useMentorProfile();

  const providers = availableProviderIds(aiConfig);
  const hasHosted = providers.some((p) => p !== 'offline');

  const [generated, setGenerated] = useState<PracticeQuestion | null>(null);
  const [genMsg, setGenMsg] = useState('');
  const [genBusy, setGenBusy] = useState(false);
  const [revealed, setRevealed] = useState(false);

  async function generate() {
    setGenBusy(true);
    setGenMsg('');
    setGenerated(null);
    setRevealed(false);
    const res = await generateQuestion(aiConfig, profile, { difficulty: 'medium' });
    if (res.ok && res.question) setGenerated(res.question);
    else setGenMsg(res.reason ?? 'Could not generate a question.');
    setGenBusy(false);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">AI Mentor</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          An always-on tutor. It works from the built-in lessons with no setup, and uses a hosted
          model when you add a key in Settings (top right).
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Active providers: {providers.join(', ')}
          {!hasHosted && ' (built-in only)'}
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <label htmlFor="goal" className="text-sm font-medium">
          Your learning goal
        </label>
        <input
          id="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. Pass a data analyst SQL interview in 8 weeks"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <p className="mt-1 text-xs text-slate-500">
          The mentor tailors its guidance to this goal.
        </p>
      </section>

      <section className="h-[460px] rounded-xl border border-slate-200 dark:border-slate-800">
        <MentorPanel />
      </section>

      <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Generate a practice question</h2>
          <button
            type="button"
            onClick={generate}
            disabled={genBusy}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {genBusy ? 'Generating…' : 'Generate'}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Every generated question is run against the database and rejected if its solution does not
          produce a stable result, so you never see a broken question.
        </p>
        {genMsg && <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">{genMsg}</p>}
        {generated && (
          <div className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="font-medium">{generated.statement}</p>
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="mt-2 text-sm text-brand-600 hover:underline"
            >
              {revealed ? 'Hide solution' : 'Show validated solution'}
            </button>
            {revealed && (
              <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-3 text-sm text-slate-100">
                <code>{generated.solution}</code>
              </pre>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
