import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Difficulty } from '../../types';
import { dayDiff, todayKey } from '../../lib/storage';
import { newCard, schedule, type CardSchedule, type Grade } from '../../lib/srs';
import { DEFAULT_AI_CONFIG, type AiConfig } from '../../lib/ai/types';
import type { LearningMode } from '../../lib/adaptive';

export const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  beginner: 10,
  easy: 15,
  medium: 25,
  hard: 40,
  expert: 60,
};

// Levels use a gently increasing curve: each level needs a bit more XP than the
// last. Returns the level (starting at 1) and progress toward the next level.
export function levelFromXp(xp: number): { level: number; into: number; span: number } {
  let level = 1;
  let remaining = xp;
  let span = 100;
  while (remaining >= span) {
    remaining -= span;
    level += 1;
    span = Math.round(span * 1.35);
  }
  return { level, into: remaining, span };
}

export interface Competency {
  label: string;
  score: number; // 0..100
}

export interface Certificate {
  id: string;
  name: string;
  score: number;
  total: number;
  issuedAt: string;
  /** Per-category mastery captured at issue time (optional for older certs). */
  competencies?: Competency[];
  skills?: string[];
}

interface ProgressState {
  xp: number;
  solved: Record<string, true>;
  completedTopics: Record<string, true>;
  streakCount: number;
  lastActiveDay: string | null;
  certificates: Certificate[];

  // Phase 2 additions. All optional-by-default so existing saved progress keeps
  // working: persist merges these defaults in for users who predate them.
  bookmarkedTopics: Record<string, true>;
  bookmarkedQuestions: Record<string, true>;
  notes: Record<string, string>;
  drafts: Record<string, string>;
  attempts: Record<string, { attempts: number; correct: number; lastAt?: string }>;
  recentActivity: ActivityItem[];
  cards: Record<string, CardSchedule>;
  aiConfig: AiConfig;
  goal: string;
  mode: LearningMode | null;

  recordSolve: (questionId: string, difficulty: Difficulty) => void;
  completeTopic: (topicId: string) => void;
  registerActivity: () => void;
  addCertificate: (cert: Certificate) => void;
  recordAttempt: (questionId: string, correct: boolean) => void;
  setAiConfig: (patch: Partial<AiConfig>) => void;
  setGoal: (goal: string) => void;
  setMode: (mode: LearningMode | null) => void;
  toggleBookmarkTopic: (topicId: string) => void;
  toggleBookmarkQuestion: (questionId: string) => void;
  setNote: (topicId: string, markdown: string) => void;
  setDraft: (questionId: string, sql: string) => void;
  reviewCard: (cardId: string, grade: Grade) => void;
  reset: () => void;
}

export interface ActivityItem {
  at: string;
  label: string;
}

function pushActivity(list: ActivityItem[], label: string): ActivityItem[] {
  return [{ at: new Date().toISOString(), label }, ...list].slice(0, 20);
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: 0,
      solved: {},
      completedTopics: {},
      streakCount: 0,
      lastActiveDay: null,
      certificates: [],
      bookmarkedTopics: {},
      bookmarkedQuestions: {},
      notes: {},
      drafts: {},
      attempts: {},
      recentActivity: [],
      cards: {},
      aiConfig: DEFAULT_AI_CONFIG,
      goal: '',
      mode: null,

      recordSolve: (questionId, difficulty) => {
        if (get().solved[questionId]) return; // award XP only once per question
        set((s) => ({
          solved: { ...s.solved, [questionId]: true },
          xp: s.xp + XP_BY_DIFFICULTY[difficulty],
          recentActivity: pushActivity(s.recentActivity, `Solved a ${difficulty} question`),
        }));
        get().registerActivity();
      },

      // Tracks every attempt for the accuracy metric, separate from the
      // first-solve XP award above.
      recordAttempt: (questionId, correct) =>
        set((s) => {
          const prev = s.attempts[questionId] ?? { attempts: 0, correct: 0 };
          return {
            attempts: {
              ...s.attempts,
              [questionId]: {
                attempts: prev.attempts + 1,
                correct: prev.correct + (correct ? 1 : 0),
                lastAt: todayKey(),
              },
            },
          };
        }),

      setAiConfig: (patch) => set((s) => ({ aiConfig: { ...s.aiConfig, ...patch } })),
      setGoal: (goal) => set({ goal }),
      setMode: (mode) => set({ mode }),

      toggleBookmarkTopic: (topicId) =>
        set((s) => {
          const next = { ...s.bookmarkedTopics };
          if (next[topicId]) delete next[topicId];
          else next[topicId] = true;
          return { bookmarkedTopics: next };
        }),

      toggleBookmarkQuestion: (questionId) =>
        set((s) => {
          const next = { ...s.bookmarkedQuestions };
          if (next[questionId]) delete next[questionId];
          else next[questionId] = true;
          return { bookmarkedQuestions: next };
        }),

      setNote: (topicId, markdown) =>
        set((s) => ({ notes: { ...s.notes, [topicId]: markdown } })),

      setDraft: (questionId, sql) =>
        set((s) => ({ drafts: { ...s.drafts, [questionId]: sql } })),

      reviewCard: (cardId, grade) =>
        set((s) => {
          const prev = s.cards[cardId] ?? newCard();
          return { cards: { ...s.cards, [cardId]: schedule(prev, grade) } };
        }),

      completeTopic: (topicId) =>
        set((s) => ({ completedTopics: { ...s.completedTopics, [topicId]: true } })),

      // Updates the daily streak. Same day keeps it, consecutive day extends it,
      // a gap resets it to 1.
      registerActivity: () => {
        const today = todayKey();
        const { lastActiveDay, streakCount } = get();
        if (lastActiveDay === today) return;
        let next = 1;
        if (lastActiveDay && dayDiff(lastActiveDay, today) === 1) {
          next = streakCount + 1;
        }
        set({ lastActiveDay: today, streakCount: next });
      },

      addCertificate: (cert) => set((s) => ({ certificates: [...s.certificates, cert] })),

      reset: () =>
        set({
          xp: 0,
          solved: {},
          completedTopics: {},
          streakCount: 0,
          lastActiveDay: null,
          certificates: [],
          bookmarkedTopics: {},
          bookmarkedQuestions: {},
          notes: {},
          drafts: {},
          attempts: {},
          recentActivity: [],
          cards: {},
          aiConfig: DEFAULT_AI_CONFIG,
          goal: '',
          mode: null,
        }),
    }),
    {
      name: 'sql-mastery-progress',
      version: 3,
      // Older saved state lacks the Phase 2 fields. Merge defaults in so it
      // loads cleanly instead of leaving fields undefined.
      migrate: (persisted) => persisted as ProgressState,
      merge: (persisted, current) => ({ ...current, ...(persisted as Partial<ProgressState>) }),
    }
  )
);

export function accuracy(attempts: Record<string, { attempts: number; correct: number }>): number {
  let a = 0;
  let c = 0;
  for (const key of Object.keys(attempts)) {
    a += attempts[key].attempts;
    c += attempts[key].correct;
  }
  return a === 0 ? 0 : Math.round((c / a) * 100);
}
