import { Link } from 'react-router-dom';
import { courses } from '../../content/courses';
import { tracks } from '../../content/tracks';

export function CoursesPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Courses</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          Mizan is built to hold many subjects. SQL is ready now; the rest are on the way.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <div
            key={c.id}
            className="flex flex-col rounded-xl border border-slate-200 p-5 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <span
                className="rounded-md px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: c.accent }}
              >
                {c.tag}
              </span>
              {c.status === 'coming-soon' && (
                <span className="rounded bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700">
                  coming soon
                </span>
              )}
            </div>
            <h2 className="mt-3 text-lg font-semibold">{c.title}</h2>
            <p className="text-sm font-medium text-slate-500">{c.subtitle}</p>
            <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-300">{c.description}</p>
            {c.status === 'available' ? (
              <Link
                to="/roadmap"
                className="mt-4 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Start course
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-4 inline-block cursor-not-allowed rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-400 dark:border-slate-700"
              >
                Not yet available
              </button>
            )}
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-bold">SQL learning paths</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Within the SQL course, these paths group topics by goal.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {tracks.map((t) => (
            <Link
              key={t.id}
              to="/paths"
              className="rounded-xl border border-slate-200 p-4 hover:border-brand-400 dark:border-slate-800"
            >
              <h3 className="font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t.description}</p>
              <p className="mt-2 text-xs text-slate-500">{t.topicIds.length} topics</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
