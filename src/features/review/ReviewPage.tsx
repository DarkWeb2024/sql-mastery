import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../progress/store';
import { buildDeck } from './deck';
import { isDue, newCard, type Grade } from '../../lib/srs';
import { allTopics } from '../../content/topics';

const GRADES: { grade: Grade; label: string }[] = [
  { grade: 'again', label: 'Again' },
  { grade: 'hard', label: 'Hard' },
  { grade: 'good', label: 'Good' },
  { grade: 'easy', label: 'Easy' },
];

export function ReviewPage() {
  const cards = useProgress((s) => s.cards);
  const attempts = useProgress((s) => s.attempts);
  const reviewCard = useProgress((s) => s.reviewCard);

  const deck = useMemo(() => buildDeck(), []);
  const due = useMemo(
    () => deck.filter((c) => isDue(cards[c.id] ?? newCard())),
    [deck, cards]
  );

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const current = due[index];

  function grade(g: Grade) {
    if (!current) return;
    reviewCard(current.id, g);
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  // Weak topics: built topics with the lowest practice accuracy so far.
  const weakTopics = useMemo(() => {
    return allTopics
      .filter((t) => !t.comingSoon)
      .map((t) => {
        let a = 0;
        let c = 0;
        for (const q of t.practice) {
          const rec = attempts[q.id];
          if (rec) {
            a += rec.attempts;
            c += rec.correct;
          }
        }
        return { topic: t, tries: a, acc: a === 0 ? null : Math.round((c / a) * 100) };
      })
      .filter((x) => x.acc !== null && x.acc < 80)
      .sort((x, y) => (x.acc ?? 0) - (y.acc ?? 0));
  }, [attempts]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Review</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          Spaced-repetition flashcards built from the lessons and command reference.
        </p>
      </header>

      <section>
        {due.length === 0 || index >= due.length ? (
          <div className="rounded-xl border border-slate-200 p-6 text-center dark:border-slate-800">
            <p className="font-medium">Nothing due right now.</p>
            <p className="mt-1 text-sm text-slate-500">
              {deck.length} cards in the deck. Come back tomorrow, or keep practising to add more.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Card {index + 1} of {due.length} · {current.source}
            </p>
            <p className="mt-3 text-lg font-medium">{current.front}</p>
            {revealed ? (
              <div className="mt-4 space-y-4">
                <p className="whitespace-pre-line rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800">
                  {current.back}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g.grade}
                      type="button"
                      onClick={() => grade(g.grade)}
                      className="rounded-md border border-slate-300 px-2 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Show answer
              </button>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Topics to revisit</h2>
        {weakTopics.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No weak spots detected yet. Accuracy under 80% on a topic will surface it here.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {weakTopics.map(({ topic, acc, tries }) => (
              <li key={topic.id}>
                <Link
                  to={`/practice/${topic.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:border-brand-400 dark:border-slate-800"
                >
                  <span className="font-medium">{topic.title}</span>
                  <span className="text-sm text-slate-500">
                    {acc}% over {tries} {tries === 1 ? 'try' : 'tries'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
