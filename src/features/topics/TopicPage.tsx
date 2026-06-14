import { Link, useParams } from 'react-router-dom';
import { getTopic } from '../../content/topics';
import { Markdown } from '../../components/Markdown';
import { useProgress } from '../../features/progress/store';

export function TopicPage() {
  const { id = '' } = useParams();
  const topic = getTopic(id);
  const solved = useProgress((s) => s.solved);

  if (!topic) {
    return (
      <div className="space-y-3">
        <p>That topic does not exist.</p>
        <Link to="/" className="text-brand-600 hover:underline">
          Back to the roadmap
        </Link>
      </div>
    );
  }

  if (topic.comingSoon) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">{topic.title}</h1>
        <p className="text-slate-600 dark:text-slate-300">{topic.summary}</p>
        <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
          This topic is on the roadmap and coming soon.
        </p>
        <Link to="/" className="text-brand-600 hover:underline">
          Back to the roadmap
        </Link>
      </div>
    );
  }

  const solvedCount = topic.practice.filter((q) => solved[q.id]).length;

  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
          {topic.category}
        </p>
        <h1 className="text-2xl font-bold">{topic.title}</h1>
        <p className="text-slate-600 dark:text-slate-300">{topic.summary}</p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            to={`/practice/${topic.id}`}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Practice ({solvedCount}/{topic.practice.length} solved)
          </Link>
          <Link
            to="/playground"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Open playground
          </Link>
        </div>
      </header>

      <section>
        <Markdown source={topic.theory} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Worked examples</h2>
        <div className="space-y-3">
          {topic.examples.map((ex, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-sm text-slate-100">
                <code>{ex.sql}</code>
              </pre>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ex.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Common mistakes</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm text-slate-700 dark:text-slate-300">
          {topic.commonMistakes.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Interview questions</h2>
        <div className="space-y-3">
          {topic.interviewQuestions.map((qa, i) => (
            <details key={i} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <summary className="cursor-pointer font-medium">{qa.q}</summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{qa.a}</p>
            </details>
          ))}
        </div>
      </section>
    </article>
  );
}
