import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Difficulty } from '../../types';
import { dayDiff, todayKey } from '../../lib/storage';

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

export interface Certificate {
  id: string;
  name: string;
  score: number;
  total: number;
  issuedAt: string;
}

interface ProgressState {
  xp: number;
  solved: Record<string, true>;
  completedTopics: Record<string, true>;
  streakCount: number;
  lastActiveDay: string | null;
  certificates: Certificate[];

  recordSolve: (questionId: string, difficulty: Difficulty) => void;
  completeTopic: (topicId: string) => void;
  registerActivity: () => void;
  addCertificate: (cert: Certificate) => void;
  reset: () => void;
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

      recordSolve: (questionId, difficulty) => {
        if (get().solved[questionId]) return; // award XP only once per question
        set((s) => ({
          solved: { ...s.solved, [questionId]: true },
          xp: s.xp + XP_BY_DIFFICULTY[difficulty],
        }));
        get().registerActivity();
      },

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
        }),
    }),
    { name: 'sql-mastery-progress' }
  )
);
