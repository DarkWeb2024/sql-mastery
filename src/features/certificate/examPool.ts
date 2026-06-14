import { allTopics } from '../../content/topics';
import type { PracticeQuestion } from '../../types';

// The exam draws from every authored practice question. Pulling from the shared
// pool means new topics automatically expand the exam with no extra wiring.
export function examQuestionPool(): PracticeQuestion[] {
  return allTopics.filter((t) => !t.comingSoon).flatMap((t) => t.practice);
}

// Fisher-Yates shuffle, used to randomise both the question selection and their
// order so two attempts are not identical.
export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickExam(count: number): PracticeQuestion[] {
  return shuffle(examQuestionPool()).slice(0, count);
}

export function makeCertificateId(): string {
  const block = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SQLM-${block()}-${block()}`;
}
