// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { askMentor, routeProvider, availableProviderIds } from './index';
import { offlineProvider } from './offline';
import { DEFAULT_AI_CONFIG, type LearnerProfile, type MentorContext } from './types';

const profile: LearnerProfile = { level: 1, weakConcepts: ['Joins'], masteredConcepts: [] };
const ctx = (over: Partial<MentorContext> = {}): MentorContext => ({ task: 'chat', profile, ...over });

describe('AI mentor layer', () => {
  it('lists only the offline provider when no keys are set', () => {
    expect(availableProviderIds(DEFAULT_AI_CONFIG)).toEqual(['offline']);
  });

  it('routes to the offline provider when nothing else is available', () => {
    expect(routeProvider(DEFAULT_AI_CONFIG, ctx()).id).toBe('offline');
  });

  it('the offline mentor explains a known command', async () => {
    const reply = await offlineProvider.respond([{ role: 'user', content: 'Explain SELECT' }], ctx());
    expect(reply.toUpperCase()).toContain('SELECT');
  });

  it('the offline mentor gives a study plan from weak concepts', async () => {
    const reply = await offlineProvider.respond(
      [{ role: 'user', content: 'what should I do next?' }],
      ctx({ task: 'study-plan' })
    );
    expect(reply).toContain('Joins');
  });

  it('askMentor never throws and reports the provider used', async () => {
    const res = await askMentor(DEFAULT_AI_CONFIG, [{ role: 'user', content: 'hello' }], ctx());
    expect(res.provider).toBe('offline');
    expect(typeof res.text).toBe('string');
  });
});
