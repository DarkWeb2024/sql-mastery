import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { allTopics } from '../content/topics';
import { missions } from '../content/missions';
import { patterns } from '../content/patterns';
import { reference } from '../content/reference';

// A global command palette: the single keystroke (Cmd/Ctrl+K) that makes the
// product feel like a tool rather than a set of pages. It indexes everything a
// learner might jump to, concepts, missions, patterns, SQL commands, and the
// main destinations, and navigates on Enter.

interface Item {
  id: string;
  label: string;
  sublabel: string;
  to: string;
  keywords: string;
}

function buildIndex(): Item[] {
  const pages: Item[] = [
    { id: 'p-tree', label: 'Knowledge Tree', sublabel: 'Explore', to: '/tree', keywords: 'map universe explore' },
    { id: 'p-missions', label: 'Missions', sublabel: 'Explore', to: '/missions', keywords: 'projects roles' },
    { id: 'p-practice', label: 'Smart Practice', sublabel: 'Practice', to: '/learn', keywords: 'practice adaptive' },
    { id: 'p-progress', label: 'Progress', sublabel: 'Track', to: '/dashboard', keywords: 'dashboard mastery analytics' },
    { id: 'p-playground', label: 'Playground', sublabel: 'Practice', to: '/playground', keywords: 'sql editor run' },
    { id: 'p-mentor', label: 'AI Navigator', sublabel: 'Help', to: '/mentor', keywords: 'mentor ai tutor guide' },
    { id: 'p-review', label: 'Review', sublabel: 'Track', to: '/review', keywords: 'flashcards spaced repetition' },
    { id: 'p-bookmarks', label: 'Library', sublabel: 'Track', to: '/bookmarks', keywords: 'bookmarks saved' },
    { id: 'p-certificate', label: 'Certificate', sublabel: 'Track', to: '/certificate', keywords: 'exam competency' },
  ];

  const concepts: Item[] = allTopics
    .filter((t) => !t.comingSoon)
    .map((t) => ({
      id: `c-${t.id}`,
      label: t.title,
      sublabel: `Concept · ${t.category}`,
      to: `/topic/${t.id}`,
      keywords: `${t.category} ${t.summary}`.toLowerCase(),
    }));

  const missionItems: Item[] = missions.map((m) => ({
    id: `m-${m.id}`,
    label: m.title,
    sublabel: `Mission · ${m.role}`,
    to: `/mission/${m.id}`,
    keywords: `${m.role} ${m.company}`.toLowerCase(),
  }));

  const patternItems: Item[] = patterns.map((p) => ({
    id: `pat-${p.id}`,
    label: p.title,
    sublabel: 'Pattern',
    to: '/tree',
    keywords: p.blurb.toLowerCase(),
  }));

  const commandItems: Item[] = reference.map((r) => ({
    id: `cmd-${r.command}`,
    label: r.command,
    sublabel: `SQL command · ${r.category}`,
    to: '/playground',
    keywords: r.explanation.toLowerCase(),
  }));

  return [...pages, ...concepts, ...missionItems, ...patternItems, ...commandItems];
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 8);
    return index
      .filter((i) => i.label.toLowerCase().includes(q) || i.keywords.includes(q) || i.sublabel.toLowerCase().includes(q))
      .slice(0, 12);
  }, [query, index]);

  // Close on Escape; the open shortcut is owned by the Layout so the header
  // search button and Cmd/Ctrl+K share one source of truth.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  function choose(item: Item) {
    onClose();
    navigate(item.to);
  }

  function onKeyDown(e: ReactKeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      choose(results[active]);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[12vh]" role="presentation">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-xl animate-fade-in overflow-hidden rounded-2xl bg-white shadow-float dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
          <Search size={18} className="text-slate-400" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Jump to a concept, mission, command…"
            aria-label="Search"
            className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] text-slate-400 dark:border-slate-700">esc</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-400">No matches.</li>}
          {results.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(item)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                  i === active ? 'bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-slate-400">{item.sublabel}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
