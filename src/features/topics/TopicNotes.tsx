import { useState } from 'react';
import { Markdown } from '../../components/Markdown';
import { useProgress } from '../progress/store';

// Personal, per-lesson notes with a markdown preview. Saved locally through the
// progress store so they persist across sessions on this device.
export function TopicNotes({ topicId }: { topicId: string }) {
  const note = useProgress((s) => s.notes[topicId] ?? '');
  const setNote = useProgress((s) => s.setNote);
  const [editing, setEditing] = useState(note.length === 0);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My notes</h2>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {editing ? 'Preview' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <textarea
          value={note}
          onChange={(e) => setNote(topicId, e.target.value)}
          placeholder="Write your own notes here. Markdown is supported."
          aria-label="Lesson notes"
          className="mt-3 h-40 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      ) : note.trim() ? (
        <div className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <Markdown source={note} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No notes yet. Click Edit to add some.</p>
      )}
    </section>
  );
}
