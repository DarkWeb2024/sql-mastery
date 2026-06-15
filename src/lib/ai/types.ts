// Shared types for the AI mentor layer. The platform never depends on the AI
// being available: there is always a deterministic offline provider, and any
// hosted provider is opt-in through a key the learner supplies.

export type ProviderId = 'offline' | 'gemini' | 'groq';

export type MentorTask = 'chat' | 'review' | 'explain-error' | 'explain-concept' | 'study-plan';

export interface MentorMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LearnerProfile {
  level: number;
  weakConcepts: string[];
  masteredConcepts: string[];
  currentTopic?: string;
  goal?: string;
}

export interface MentorContext {
  task: MentorTask;
  profile: LearnerProfile;
  topicId?: string;
  questionStatement?: string;
  userQuery?: string;
  lastError?: string;
  expectedSummary?: string;
}

export interface MentorProvider {
  id: ProviderId;
  label: string;
  /** Whether this provider can be used right now (e.g. a key is configured). */
  available: () => boolean;
  respond: (messages: MentorMessage[], context: MentorContext) => Promise<string>;
}

export interface AiConfig {
  provider: ProviderId; // preferred provider; falls back to offline if unavailable
  geminiKey?: string;
  groqKey?: string;
  /** When true, the router may pick a provider per task; otherwise use `provider`. */
  autoRoute: boolean;
}

export const DEFAULT_AI_CONFIG: AiConfig = { provider: 'offline', autoRoute: true };

// The system prompt that turns a general model into an elite, Socratic SQL
// tutor. It is shared by all hosted providers.
export function tutorSystemPrompt(profile: LearnerProfile): string {
  return [
    'You are an elite private SQL tutor. You are not a generic chatbot.',
    'Teach the way a great mentor does: be concise, build on what the learner knows,',
    'surface misconceptions, and prefer a guiding hint over handing over the full answer',
    'unless the learner explicitly asks for the solution.',
    'When you show SQL, keep it correct and runnable against a SQLite database.',
    'If you are unsure, say so rather than inventing a result.',
    '',
    `Learner level: ${profile.level}.`,
    profile.currentTopic ? `Current topic: ${profile.currentTopic}.` : '',
    profile.weakConcepts.length ? `Weak areas to reinforce: ${profile.weakConcepts.join(', ')}.` : '',
    profile.goal ? `Stated goal: ${profile.goal}.` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
