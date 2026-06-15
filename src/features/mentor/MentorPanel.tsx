import { useState } from 'react';
import { useProgress } from '../progress/store';
import { useMentorProfile } from './useMentorProfile';
import { askMentor, type MentorMessage, type MentorTask } from '../../lib/ai';

interface Props {
  // Optional practice context so the mentor can review the current query.
  topicId?: string;
  questionStatement?: string;
  userQuery?: string;
  lastError?: string;
  compact?: boolean;
}

const GREETING: MentorMessage = {
  role: 'assistant',
  content:
    'I am your SQL mentor. Ask me to explain a concept, review your query, or plan what to study next. Connect an AI key in Settings for open-ended help; without one I answer from the built-in lessons.',
};

// The mentor chat. Works with the offline provider out of the box and uses a
// hosted model when a key is configured. Used both on its own page and docked in
// the practice workspace.
export function MentorPanel({ topicId, questionStatement, userQuery, lastError, compact }: Props) {
  const aiConfig = useProgress((s) => s.aiConfig);
  const profile = useMentorProfile(topicId);
  const [messages, setMessages] = useState<MentorMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(text: string, task: MentorTask = 'chat') {
    if (!text.trim() || busy) return;
    const next: MentorMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    const { text: reply } = await askMentor(aiConfig, next, {
      task,
      profile,
      topicId,
      questionStatement,
      userQuery,
      lastError,
    });
    setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    setBusy(false);
  }

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex-1 space-y-3 overflow-y-auto p-3"
        role="log"
        aria-live="polite"
        aria-label="Mentor conversation"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] whitespace-pre-line rounded-lg px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
            }`}
          >
            {m.content}
          </div>
        ))}
        {busy && <p className="text-sm text-slate-400">Thinking…</p>}
      </div>

      {!compact && (
        <div className="flex flex-wrap gap-2 px-3 pb-2">
          <Quick label="Review my query" onClick={() => send('Please review my current query.', 'review')} disabled={busy || !userQuery} />
          <Quick label="What should I study next?" onClick={() => send('What should I study next?', 'study-plan')} disabled={busy} />
        </div>
      )}

      <form
        className="flex gap-2 border-t border-slate-200 p-2 dark:border-slate-800"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label className="sr-only" htmlFor="mentor-input">
          Ask the mentor
        </label>
        <input
          id="mentor-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the mentor…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function Quick({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      {label}
    </button>
  );
}
