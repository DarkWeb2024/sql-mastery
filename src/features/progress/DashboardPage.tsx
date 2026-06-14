import { Link } from 'react-router-dom';
import { useProgress, levelFromXp } from './store';
import { allTopics } from '../../content/topics';

interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
}

export function DashboardPage() {
  const { xp, solved, completedTopics, streakCount, certificates, reset } = useProgress();
  const { level, into, span } = levelFromXp(xp);
  const solvedCount = Object.keys(solved).length;
  const builtTopics = allTopics.filter((t) => !t.comingSoon);
  const totalQuestions = builtTopics.reduce((n, t) => n + t.practice.length, 0);

  const achievements: Achievement[] = [
    { id: 'first', title: 'First steps', description: 'Solve your first question.', earned: solvedCount >= 1 },
    { id: 'five', title: 'Getting warm', description: 'Solve five questions.', earned: solvedCount >= 5 },
    {
      id: 'topic',
      title: 'Topic cleared',
      description: 'Solve every question in a topic.',
      earned: Object.keys(completedTopics).length >= 1,
    },
    { id: 'streak', title: 'Consistent', description: 'Reach a three day streak.', earned: streakCount >= 3 },
    { id: 'cert', title: 'Certified', description: 'Pass a certification exam.', earned: certificates.length >= 1 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Your progress</h1>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Level" value={`${level}`} sub={`${into}/${span} XP to next`} />
        <Stat label="Total XP" value={`${xp}`} sub={`${solvedCount}/${totalQuestions} questions solved`} />
        <Stat label="Daily streak" value={`${streakCount}`} sub={streakCount === 1 ? 'day' : 'days'} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Topics</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {builtTopics.map((t) => {
            const done = Boolean(completedTopics[t.id]);
            const solvedInTopic = t.practice.filter((q) => solved[q.id]).length;
            return (
              <li key={t.id}>
                <Link
                  to={`/topic/${t.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:border-brand-400 dark:border-slate-800"
                >
                  <span className="font-medium">{t.title}</span>
                  <span className={done ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500'}>
                    {solvedInTopic}/{t.practice.length}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Achievements</h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => (
            <li
              key={a.id}
              className={`rounded-lg border p-3 ${
                a.earned
                  ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40'
                  : 'border-slate-200 opacity-60 dark:border-slate-800'
              }`}
            >
              <p className="font-semibold">{a.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{a.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Certificates</h2>
        {certificates.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No certificates yet.{' '}
            <Link to="/certificate" className="text-brand-600 hover:underline">
              Take the certification exam
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-2">
            {certificates.map((c) => (
              <li key={c.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-sm text-slate-500">
                    {c.score}/{c.total} · {new Date(c.issuedAt).toLocaleDateString()}
                  </span>
                </div>
                <Link to={`/verify/${c.id}`} className="font-mono text-xs text-brand-600 hover:underline">
                  Verify {c.id}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-slate-200 pt-4 dark:border-slate-800">
        <button
          type="button"
          onClick={() => {
            if (confirm('Reset all local progress? This cannot be undone.')) reset();
          }}
          className="text-sm text-red-600 hover:underline"
        >
          Reset progress
        </button>
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}
