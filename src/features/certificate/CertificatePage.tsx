import { useCallback, useEffect, useRef, useState } from 'react';
import { SqlEditor } from '../../components/SqlEditor';
import { getDataset } from '../../content/datasets';
import { runQuery } from '../../lib/sqlEngine';
import { compareResults } from '../../lib/validate';
import { useProgress, type Certificate } from '../progress/store';
import { downloadCertificate } from './certificatePdf';
import { makeCertificateId, pickExam } from './examPool';
import { buildLearnerGraph, concepts } from '../../lib/knowledgeGraph';
import { allTopics } from '../../content/topics';
import type { PracticeQuestion } from '../../types';

const EXAM_SIZE = 6;
const PASS_RATIO = 0.7;
const TIME_LIMIT_SECONDS = 10 * 60;

type Phase = 'intro' | 'exam' | 'result';

export function CertificatePage() {
  const addCertificate = useProgress((s) => s.addCertificate);
  const attempts = useProgress((s) => s.attempts);
  const solved = useProgress((s) => s.solved);

  const [phase, setPhase] = useState<Phase>('intro');
  const [name, setName] = useState('');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(TIME_LIMIT_SECONDS);
  const [blurWarnings, setBlurWarnings] = useState(0);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [busy, setBusy] = useState(false);

  const finishedRef = useRef(false);

  const finish = useCallback(
    (finalCorrect: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const passed = finalCorrect / EXAM_SIZE >= PASS_RATIO;
      if (passed) {
        // Capture a competency breakdown from the mastery model at issue time, so
        // the certificate reflects demonstrated ability per area, not just a score.
        const graph = buildLearnerGraph(attempts, solved);
        const builtTopics = allTopics.filter((t) => !t.comingSoon);
        const categories = [...new Set(builtTopics.map((t) => t.category))];
        const competencies = categories.map((cat) => {
          const ids = builtTopics.filter((t) => t.category === cat).map((t) => t.id);
          const vals = ids.map((id) => graph.mastery[id]?.effective ?? 0);
          const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
          return { label: cat, score: Math.round(avg * 100) };
        });
        const skills = concepts
          .filter((c) => graph.mastery[c.id]?.state === 'mastered')
          .map((c) => c.title);

        const cert: Certificate = {
          id: makeCertificateId(),
          name: name.trim() || 'SQL Learner',
          score: finalCorrect,
          total: EXAM_SIZE,
          issuedAt: new Date().toISOString(),
          competencies,
          skills,
        };
        addCertificate(cert);
        setCertificate(cert);
      } else {
        setCertificate(null);
      }
      setPhase('result');
    },
    [addCertificate, name, attempts, solved]
  );

  // Countdown timer. When it hits zero the exam ends automatically.
  useEffect(() => {
    if (phase !== 'exam') return;
    if (secondsLeft <= 0) {
      finish(correctCount);
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, secondsLeft, correctCount, finish]);

  // Basic anti-cheat: leaving the tab during the exam is recorded and surfaced.
  useEffect(() => {
    if (phase !== 'exam') return;
    const onBlur = () => setBlurWarnings((n) => n + 1);
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [phase]);

  function start() {
    finishedRef.current = false;
    setQuestions(pickExam(EXAM_SIZE));
    setIndex(0);
    setQuery('');
    setCorrectCount(0);
    setAnswered(false);
    setLastCorrect(null);
    setSecondsLeft(TIME_LIMIT_SECONDS);
    setBlurWarnings(0);
    setCertificate(null);
    setPhase('exam');
  }

  async function submitAnswer() {
    const q = questions[index];
    if (!q || answered) return;
    setBusy(true);
    const dataset = getDataset(q.datasetId);
    const userOutcome = await runQuery(dataset.id, dataset.seedSql, query);
    const expectedOutcome = await runQuery(dataset.id, dataset.seedSql, q.solution);
    let correct = false;
    if (userOutcome.ok && userOutcome.result && expectedOutcome.ok && expectedOutcome.result) {
      correct = compareResults(expectedOutcome.result, userOutcome.result, q.orderMatters).correct;
    }
    if (correct) setCorrectCount((c) => c + 1);
    setLastCorrect(correct);
    setAnswered(true);
    setBusy(false);
  }

  function next() {
    const nextCorrect = correctCount;
    if (index + 1 >= questions.length) {
      finish(nextCorrect);
      return;
    }
    setIndex((i) => i + 1);
    setQuery('');
    setAnswered(false);
    setLastCorrect(null);
  }

  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold">SQL Certification Exam</h1>
        <p className="text-slate-600 dark:text-slate-300">
          {EXAM_SIZE} randomised questions, {TIME_LIMIT_SECONDS / 60} minutes, drawn from every
          topic. You need {Math.ceil(EXAM_SIZE * PASS_RATIO)} correct to pass. Questions are answered
          one at a time and cannot be revisited. Leaving the tab is recorded.
        </p>
        <p className="text-sm text-slate-500">
          On passing you receive a Certificate of Completion with a verification ID and a downloadable
          PDF. This is not an externally accredited certificate.
        </p>
        <label className="block">
          <span className="text-sm font-medium">Name to print on the certificate</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <button
          type="button"
          onClick={start}
          disabled={name.trim().length === 0}
          className="rounded-md bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          Start exam
        </button>
      </div>
    );
  }

  if (phase === 'exam') {
    const q = questions[index];
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = String(secondsLeft % 60).padStart(2, '0');
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Question {index + 1} of {questions.length}
          </h1>
          <div className="flex items-center gap-3 text-sm">
            {blurWarnings > 0 && (
              <span className="rounded bg-red-100 px-2 py-1 text-red-700 dark:bg-red-950/50 dark:text-red-300">
                {blurWarnings} tab switch{blurWarnings === 1 ? '' : 'es'}
              </span>
            )}
            <span
              className={`rounded px-2 py-1 font-mono font-semibold ${
                secondsLeft < 60
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                  : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {minutes}:{seconds}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium uppercase dark:bg-slate-800">
            {q.difficulty}
          </span>
          <p className="mt-2 font-medium">{q.statement}</p>
          <p className="mt-1 text-xs text-slate-500">
            Dataset: <span className="font-mono">{q.datasetId}</span>
          </p>
        </div>

        <SqlEditor value={query} onChange={setQuery} onRun={submitAnswer} height={180} />

        {!answered ? (
          <button
            type="button"
            onClick={submitAnswer}
            disabled={busy}
            className="rounded-md bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? 'Checking…' : 'Submit answer'}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                lastCorrect
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
              }`}
            >
              {lastCorrect ? 'Correct' : 'Incorrect'}
            </span>
            <button
              type="button"
              onClick={next}
              className="rounded-md bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
            >
              {index + 1 >= questions.length ? 'Finish exam' : 'Next question'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // result phase
  const passed = certificate !== null;
  return (
    <div className="mx-auto max-w-2xl space-y-4 text-center">
      <h1 className="text-2xl font-bold">{passed ? 'You passed' : 'Not passed this time'}</h1>
      <p className="text-slate-600 dark:text-slate-300">
        You answered {correctCount} of {EXAM_SIZE} correctly.
      </p>
      {passed && certificate ? (
        <div className="space-y-3 rounded-xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-700 dark:bg-emerald-950/30">
          <p className="font-medium">Certificate issued to {certificate.name}</p>
          <p className="font-mono text-sm">ID: {certificate.id}</p>
          <button
            type="button"
            onClick={() => downloadCertificate(certificate)}
            className="rounded-md bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
          >
            Download PDF
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          You need {Math.ceil(EXAM_SIZE * PASS_RATIO)} correct to pass. Review the topics and try
          again.
        </p>
      )}
      <button
        type="button"
        onClick={() => setPhase('intro')}
        className="rounded-md border border-slate-300 px-5 py-2.5 font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        Back to start
      </button>
    </div>
  );
}
