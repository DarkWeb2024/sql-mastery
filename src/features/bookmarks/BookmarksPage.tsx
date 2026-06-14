import { Link } from 'react-router-dom';
import { useProgress } from '../progress/store';
import { allTopics, getTopic } from '../../content/topics';

// Resolves a bookmarked question id back to its topic so we can link to it.
function findQuestionTopic(questionId: string) {
  for (const topic of allTopics) {
    const q = topic.practice.find((p) => p.id === questionId);
    if (q) return { topic, question: q };
  }
  return null;
}

export function BookmarksPage() {
  const bookmarkedTopics = useProgress((s) => s.bookmarkedTopics);
  const bookmarkedQuestions = useProgress((s) => s.bookmarkedQuestions);

  const topicIds = Object.keys(bookmarkedTopics);
  const questionIds = Object.keys(bookmarkedQuestions);
  const empty = topicIds.length === 0 && questionIds.length === 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Bookmarks</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          Lessons and questions you saved for later.
        </p>
      </header>

      {empty && (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">
          <p>You have not bookmarked anything yet.</p>
          <p className="mt-1 text-sm">
            Use the bookmark control on any lesson or question to save it here.
          </p>
        </div>
      )}

      {topicIds.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Lessons</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {topicIds.map((id) => {
              const topic = getTopic(id);
              if (!topic) return null;
              return (
                <li key={id}>
                  <Link
                    to={`/topic/${id}`}
                    className="block rounded-lg border border-slate-200 p-3 hover:border-brand-400 dark:border-slate-800"
                  >
                    <span className="font-medium">{topic.title}</span>
                    <span className="mt-1 block text-sm text-slate-500">{topic.category}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {questionIds.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Questions</h2>
          <ul className="space-y-2">
            {questionIds.map((id) => {
              const found = findQuestionTopic(id);
              if (!found) return null;
              return (
                <li key={id}>
                  <Link
                    to={`/practice/${found.topic.id}`}
                    className="block rounded-lg border border-slate-200 p-3 hover:border-brand-400 dark:border-slate-800"
                  >
                    <span className="font-medium">{found.question.statement}</span>
                    <span className="mt-1 block text-sm text-slate-500">
                      {found.topic.title} · {found.question.difficulty}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
