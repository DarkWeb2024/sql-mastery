import { Link } from 'react-router-dom';
import { useProgress, levelFromXp, accuracy } from './store';
import { allTopics } from '../../content/topics';
import { SkillRadar } from '../../components/SkillRadar';
import { CompletionMap } from '../../components/CompletionMap';
import { buildLearnerGraph } from '../../lib/knowledgeGraph';
import { overallMasteryScore } from '../../lib/mastery';
import { interviewReadiness, learningVelocity, retentionRate } from '../../lib/analytics';

interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
}

export function DashboardPage() {
  const { xp, solved, completedTopics, streakCount, certificates, attempts, recentActivity, reset } =
    useProgress();
  const { level, into, span } = levelFromXp(xp);
  const solvedCount = Object.keys(solved).length;
  const builtTopics = allTopics.filter((t) => !t.comingSoon);
  const totalQuestions = builtTopics.reduce((n, t) => n + t.practice.length, 0);
  const acc = accuracy(attempts);

  // Mastery-model-derived analytics.
  const graph = buildLearnerGraph(attempts, solved);
  const masteries = Object.values(graph.mastery);
  const masteryScore = overallMasteryScore(masteries);
  const retention = retentionRate(masteries);
  const velocity = learningVelocity(recentActivity);
  const hardQuestions = builtTopics.flatMap((t) =>
    t.practice.filter((q) => q.difficulty === 'hard' || q.difficulty === 'expert')
  );
  const hardSolved = hardQuestions.filter((q) => solved[q.id]).length;
  const readiness = interviewReadiness(masteries, hardSolved, hardQuestions.length);

  // One radar axis per topic category: how much of that category is solved.
  const categories = Array.from(new Set(builtTopics.map((t) => t.category)));
  const radarAxes = categories.map((cat) => {
    const inCat = builtTopics.filter((t) => t.category === cat);
    const total = inCat.reduce((n, t) => n + t.practice.length, 0);
    const done = inCat.reduce((n, t) => n + t.practice.filter((q) => solved[q.id]).length, 0);
    return { label: cat, value: total === 0 ? 0 : done / total };
  });

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Your progress</h1>
        <div className="flex gap-3 text-sm">
          <Link to="/bookmarks" className="text-brand-600 hover:underline">
            Bookmarks
          </Link>
          <Link to="/review" className="text-brand-600 hover:underline">
            Review
          </Link>
          <Link to="/paths" className="text-brand-600 hover:underline">
            Learning paths
          </Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Level" value={`${level}`} sub={`${into}/${span} XP to next`} />
        <Stat label="Total XP" value={`${xp}`} sub={`${solvedCount}/${totalQuestions} questions solved`} />
        <Stat label="Accuracy" value={`${acc}%`} sub="across all attempts" />
        <Stat label="Daily streak" value={`${streakCount}`} sub={streakCount === 1 ? 'day' : 'days'} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Learning analytics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Mastery score" value={`${masteryScore}`} sub="effective mastery, 0-100" />
          <Stat label="Interview readiness" value={`${readiness}`} sub="mastery + hard questions" />
          <Stat label="Retention" value={`${retention}%`} sub="how much is still fresh" />
          <Stat label="Velocity" value={`${velocity}`} sub="solves in the last 7 days" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="mb-2 text-lg font-semibold">Skill coverage</h2>
          <div className="flex justify-center text-slate-600 dark:text-slate-300">
            <SkillRadar axes={radarAxes} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="mb-3 text-lg font-semibold">Completion map</h2>
          <CompletionMap />
        </div>
      </section>

      {recentActivity.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Recent activity</h2>
          <ul className="space-y-1 text-sm">
            {recentActivity.slice(0, 8).map((a, i) => (
              <li key={i} className="flex justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800">
                <span>{a.label}</span>
                <span className="text-slate-400">{new Date(a.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

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
