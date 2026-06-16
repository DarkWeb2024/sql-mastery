import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Reveal } from '../../components/Reveal';
import { courses } from '../../content/courses';
import { useProgress, levelFromXp } from '../progress/store';
import { allTopics } from '../../content/topics';
import { withAlpha } from '../../lib/palette';

const MARQUEE = [
  'SELECT', 'JOINS', 'GROUP BY', 'WINDOW FUNCTIONS', 'CTEs', 'SUBQUERIES',
  'ANALYTICS', 'MISSIONS', 'INTERVIEW SQL', 'SET OPERATIONS',
];

const capabilities = [
  { no: '01', title: 'Knowledge Universe', to: '/tree', color: '#4F8CFF', desc: 'The whole of SQL as one living map. Pan, zoom, and watch mastery light up.' },
  { no: '02', title: 'Real missions', to: '/missions', color: '#F43F5E', desc: 'Act as an analyst on a real business problem. Investigate, decide, defend.' },
  { no: '03', title: 'AI Navigator', to: '/mentor', color: '#8B5CF6', desc: 'A tutor that knows your weak spots and never hands you a wrong answer.' },
  { no: '04', title: 'In-browser engine', to: '/playground', color: '#22C55E', desc: 'A real SQLite database runs locally. Write, run, and see results instantly.' },
  { no: '05', title: 'Certification', to: '/certificate', color: '#F59E0B', desc: 'A timed exam and a competency breakdown that reflects actual ability.' },
];

export function LandingPage() {
  const xp = useProgress((s) => s.xp);
  const solved = useProgress((s) => s.solved);
  const { level } = levelFromXp(xp);
  const built = allTopics.filter((t) => !t.comingSoon);
  const totalQuestions = built.reduce((n, t) => n + t.practice.length, 0);
  const solvedCount = Object.keys(solved).length;
  const started = xp > 0 || solvedCount > 0;

  return (
    <div className="space-y-28 pb-16">
      {/* Hero */}
      <section className="pt-10 sm:pt-16">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
            A learning studio for data
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display-xl mt-6">
            Where data becomes <span className="text-gradient">decisions.</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <div className="mt-8 flex max-w-2xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Mizan turns SQL into a craft: short theory, deep practice, and missions where you
              reason like a professional. It runs entirely in your browser.
            </p>
          </div>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/tree"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-700"
            >
              {started ? 'Continue learning' : 'Enter the universe'}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
            </Link>
            <Link
              to="/missions"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-7 py-3.5 text-base font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Try a mission
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Marquee */}
      <div className="marquee border-y border-slate-200/70 py-5 dark:border-slate-800/70" aria-hidden="true">
        {[0, 1].map((dup) => (
          <div className="marquee-track" key={dup}>
            {MARQUEE.map((w, i) => (
              <span key={`${dup}-${i}`} className="flex items-center gap-10 text-2xl font-semibold text-slate-400 dark:text-slate-600">
                {w}
                <span className="text-brand-500">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Capabilities as big interactive rows */}
      <section>
        <Reveal>
          <h2 className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">What's inside</h2>
        </Reveal>
        <ul className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
          {capabilities.map((cap, i) => (
            <Reveal as="li" key={cap.no} delay={i * 60}>
              <Link
                to={cap.to}
                className="row-link group flex items-center gap-5 py-7"
                style={{ ['--hover' as string]: cap.color }}
              >
                <span className="w-10 font-mono text-sm text-slate-400">{cap.no}</span>
                <span className="flex-1">
                  <span
                    className="block text-3xl font-bold tracking-tight transition-colors sm:text-4xl"
                    style={{ color: 'inherit' }}
                  >
                    <span className="bg-[length:0%_2px] bg-bottom bg-no-repeat transition-all duration-300 group-hover:bg-[length:100%_2px]" style={{ backgroundImage: `linear-gradient(${cap.color}, ${cap.color})` }}>
                      {cap.title}
                    </span>
                  </span>
                  <span className="mt-1 block max-w-xl text-sm text-slate-500 dark:text-slate-400">{cap.desc}</span>
                </span>
                <ArrowUpRight
                  size={28}
                  className="shrink-0 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-slate-600"
                  style={{ color: cap.color }}
                />
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Courses */}
      <section>
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Courses</h2>
            <Link to="/courses" className="text-sm font-medium text-brand-600 hover:underline">
              See all
            </Link>
          </div>
        </Reveal>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c, i) => (
            <Reveal key={c.id} delay={i * 70}>
              <div
                className="lift flex h-full flex-col rounded-2xl border border-slate-200 bg-white/60 p-5 dark:border-slate-800 dark:bg-slate-900/50"
                style={{ ['--glow' as string]: withAlpha(c.accent, 0.4) }}
              >
                <span className="inline-block h-2.5 w-12 rounded-full" style={{ backgroundColor: c.accent }} aria-hidden="true" />
                <h3 className="mt-4 text-xl font-bold">{c.title}</h3>
                <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-300">{c.subtitle}</p>
                {c.status === 'available' ? (
                  <Link to="/tree" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: c.accent }}>
                    Start <ArrowRight size={15} />
                  </Link>
                ) : (
                  <span className="mt-4 text-sm text-slate-400">Coming soon</span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section>
        <Reveal>
          <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white/50 p-10 dark:border-slate-800 dark:bg-slate-900/40 sm:grid-cols-3">
            <Stat value={`${built.length}`} label="SQL topics, fully built" />
            <Stat value={`${totalQuestions}`} label="Validated practice questions" />
            <Stat value={started ? `Lv ${level}` : '100%'} label={started ? 'your current level' : 'runs in your browser'} />
          </div>
        </Reveal>
      </section>

      {/* Quote */}
      <section>
        <Reveal>
          <blockquote className="mx-auto max-w-4xl text-center">
            <p className="text-2xl font-semibold leading-snug tracking-tight sm:text-4xl">
              "Real jobs are not <span className="text-slate-400">write a HAVING clause.</span> They are
              <span className="text-gradient"> our revenue dropped 12 percent, find out why.</span>"
            </p>
            <footer className="mt-5 text-sm uppercase tracking-[0.2em] text-slate-500">The Mizan philosophy</footer>
          </blockquote>
        </Reveal>
      </section>

      {/* CTA band */}
      <Reveal>
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-[#8B5CF6] p-12 text-center text-white sm:p-16">
          <h2 className="display-xl text-white" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}>
            Start thinking in SQL.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-50">
            No account, no setup. Open the universe and solve your first problem in minutes.
          </p>
          <Link
            to="/tree"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-brand-700 hover:bg-brand-50"
          >
            Enter the universe <ArrowRight size={18} />
          </Link>
        </section>
      </Reveal>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="display-xl" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
        {value}
      </div>
      <div className="mt-2 text-sm text-slate-500">{label}</div>
    </div>
  );
}
