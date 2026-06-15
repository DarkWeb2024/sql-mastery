import { reference } from '../../content/reference';
import { getTopic } from '../../content/topics';
import type { MentorMessage, MentorProvider, MentorContext } from './types';

// The offline mentor is deterministic and always available. It will not match a
// large model for open-ended chat, but for the things that matter most while
// practising, reviewing a query, understanding an error, recalling a command, it
// gives accurate, grounded help drawn from the platform's own content. This
// means the "AI mentor" is never empty, even with no key and no network.

function findReference(text: string) {
  const upper = text.toUpperCase();
  return reference.find((r) => upper.includes(r.command.split(' ')[0]));
}

function reviewQuery(ctx: MentorContext): string {
  const lines: string[] = [];
  if (ctx.lastError) {
    lines.push(`Your query did not run. SQLite reported: ${ctx.lastError}`);
    lines.push('Check table and column names against the schema, and that text values use single quotes.');
  } else {
    lines.push('Your query ran. Compare your result to what the task asks for, row by row.');
    if (ctx.expectedSummary) lines.push(ctx.expectedSummary);
  }
  const ref = ctx.userQuery ? findReference(ctx.userQuery) : undefined;
  if (ref) {
    lines.push('');
    lines.push(`On ${ref.command}: ${ref.explanation}`);
    if (ref.commonMistakes[0]) lines.push(`Watch out: ${ref.commonMistakes[0]}`);
  }
  return lines.join('\n');
}

function explainConcept(ctx: MentorContext, question: string): string {
  const ref = findReference(question);
  if (ref) {
    return [
      `${ref.command}: ${ref.explanation}`,
      `Syntax: ${ref.syntax}`,
      `Example: ${ref.example}`,
      ref.commonMistakes[0] ? `Common mistake: ${ref.commonMistakes[0]}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }
  const topic = ctx.topicId ? getTopic(ctx.topicId) : undefined;
  if (topic && !topic.comingSoon) {
    return `${topic.summary}\n\nOpen the lesson for ${topic.title} for the full explanation and worked examples.`;
  }
  return 'I can explain any SQL command. Try asking about SELECT, WHERE, GROUP BY, HAVING, or JOIN, or connect an AI key in settings for open-ended help.';
}

function studyPlan(ctx: MentorContext): string {
  if (ctx.profile.weakConcepts.length === 0) {
    return 'You have no weak areas flagged yet. Keep practising and I will point you to the concepts that need reinforcement.';
  }
  return [
    'Here is where to focus next, weakest first:',
    ...ctx.profile.weakConcepts.map((c, i) => `${i + 1}. ${c}`),
    '',
    'Short, daily retrieval sessions on these will move your mastery faster than long cramming.',
  ].join('\n');
}

export const offlineProvider: MentorProvider = {
  id: 'offline',
  label: 'Built-in mentor (no key)',
  available: () => true,
  respond: async (messages: MentorMessage[], ctx: MentorContext) => {
    const last = [...messages].reverse().find((m) => m.role === 'user');
    const text = last?.content ?? '';

    if (ctx.task === 'review' || ctx.lastError) return reviewQuery(ctx);
    if (ctx.task === 'study-plan' || /study plan|what.*next|where.*focus/i.test(text)) {
      return studyPlan(ctx);
    }
    if (ctx.task === 'explain-error') return reviewQuery({ ...ctx, task: 'review' });
    return explainConcept(ctx, text);
  },
};
