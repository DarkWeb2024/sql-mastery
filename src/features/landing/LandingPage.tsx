import { Link } from 'react-router-dom';
import { BrandMark } from '../../components/BrandMark';
import { courses } from '../../content/courses';
import { useProgress, levelFromXp } from '../progress/store';
import { allTopics } from '../../content/topics';

const features = [
  {
    title: 'Practice-first',
    body: 'Short theory, then a lot of doing. Most of your time is spent writing and running real queries.',
  },
  {
    title: 'Runs in your browser',
    body: 'A real SQLite engine runs locally. No sign-up, no servers, nothing to install.',
  },
  {
    title: 'Graded the honest way',
    body: 'Your query is checked against the correct answer by actually running both and comparing.',
  },
  {
    title: 'Track your growth',
    body: 'Experience, levels, streaks, accuracy, and spaced-repetition review keep you moving.',
  },
];

// Placeholder testimonials, clearly labelled, so the section design exists
// without pretending to quote real people.
const testimonials = [
  { quote: 'Sample testimonial placeholder for layout purposes.', name: 'Learner', role: 'Placeholder' },
  { quote: 'Sample testimonial placeholder for layout purposes.', name: 'Analyst', role: 'Placeholder' },
];

export function LandingPage() {
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streakCount);
  const solved = useProgress((s) => s.solved);
  const { level } = levelFromXp(xp);
  const totalQuestions = allTopics
    .filter((t) => !t.comingSoon)
    .reduce((n, t) => n + t.practice.length, 0);
  const solvedCount = Object.keys(solved).length;
  const started = xp > 0 || solvedCount > 0;

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-8 py-8 md:grid-cols-2">
        <div className="space-y-5">
          <BrandMark size={44} />
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Where data becomes decisions.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Mizan is a practice-first platform for learning data and programming. Mizan means balance
            and measure: the craft of weighing evidence and deciding well. Start with SQL, with more
            on the way.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/roadmap"
              className="rounded-md bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
            >
              {started ? 'Continue learning' : 'Start the SQL course'}
            </Link>
            <Link
              to="/courses"
              className="rounded-md border border-slate-300 px-5 py-2.5 font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Browse courses
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
            <code>{`SELECT d.name AS department,
       AVG(e.salary) AS avg_salary
FROM employees e
JOIN departments d
  ON e.department_id = d.id
GROUP BY d.id, d.name
ORDER BY avg_salary DESC;`}</code>
          </pre>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Real queries, run live in the playground.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Why Mizan</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Courses</h2>
          <Link to="/courses" className="text-sm text-brand-600 hover:underline">
            See all
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <div
              key={c.id}
              className="flex flex-col rounded-xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <span
                className="inline-block h-2 w-10 rounded-full"
                style={{ backgroundColor: c.accent }}
                aria-hidden="true"
              />
              <h3 className="mt-3 font-semibold">{c.title}</h3>
              <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-300">{c.subtitle}</p>
              {c.status === 'available' ? (
                <Link to="/roadmap" className="mt-3 text-sm font-medium text-brand-600 hover:underline">
                  Start
                </Link>
              ) : (
                <span className="mt-3 text-sm text-slate-400">Coming soon</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {started && (
        <section>
          <h2 className="text-2xl font-bold">Your progress</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <PreviewStat label="Level" value={`${level}`} />
            <PreviewStat label="Questions solved" value={`${solvedCount}/${totalQuestions}`} />
            <PreviewStat label="Streak" value={`${streak} day${streak === 1 ? '' : 's'}`} />
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold">What learners say</h2>
        <p className="text-sm text-slate-500">Placeholder content for layout; not real quotes.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {testimonials.map((t, i) => (
            <figure key={i} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <blockquote className="text-slate-600 dark:text-slate-300">{t.quote}</blockquote>
              <figcaption className="mt-2 text-sm font-medium">
                {t.name} <span className="text-slate-400">· {t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-brand-600 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to write some SQL?</h2>
        <p className="mt-2 text-brand-50">No account needed. Start solving in your browser right now.</p>
        <Link
          to="/roadmap"
          className="mt-4 inline-block rounded-md bg-white px-5 py-2.5 font-semibold text-brand-700 hover:bg-brand-50"
        >
          Open the roadmap
        </Link>
      </section>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
