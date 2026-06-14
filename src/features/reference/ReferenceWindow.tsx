import { useEffect, useRef, useState } from 'react';
import { reference } from '../../content/reference';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const DEFAULT_BOX: Box = { x: 80, y: 90, w: 560, h: 420 };

// A floating, draggable, resizable command reference. It behaves like a panel in
// a desktop IDE: move it by the title bar, resize from the corner, minimise to
// the title bar, maximise to fill the screen, or pin it on top.
export function ReferenceWindow({ open, onClose }: Props) {
  const [box, setBox] = useState<Box>(DEFAULT_BOX);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [selected, setSelected] = useState(0);

  const dragRef = useRef<{ dx: number; dy: number } | null>(null);
  const resizeRef = useRef<{ sx: number; sy: number; sw: number; sh: number } | null>(null);
  const restoreRef = useRef<Box>(DEFAULT_BOX);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pinned) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, pinned, onClose]);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (dragRef.current) {
        setBox((b) => ({
          ...b,
          x: Math.max(0, e.clientX - dragRef.current!.dx),
          y: Math.max(0, e.clientY - dragRef.current!.dy),
        }));
      } else if (resizeRef.current) {
        const r = resizeRef.current;
        setBox((b) => ({
          ...b,
          w: Math.max(320, r.sw + (e.clientX - r.sx)),
          h: Math.max(220, r.sh + (e.clientY - r.sy)),
        }));
      }
    }
    function onUp() {
      dragRef.current = null;
      resizeRef.current = null;
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  if (!open) return null;

  const style = maximized
    ? { left: 8, top: 72, width: 'calc(100vw - 16px)', height: 'calc(100vh - 88px)' }
    : { left: box.x, top: box.y, width: box.w, height: minimized ? undefined : box.h };

  function startDrag(e: React.PointerEvent) {
    if (maximized) return;
    dragRef.current = { dx: e.clientX - box.x, dy: e.clientY - box.y };
  }

  function toggleMaximize() {
    if (maximized) {
      setBox(restoreRef.current);
      setMaximized(false);
    } else {
      restoreRef.current = box;
      setMaximized(true);
      setMinimized(false);
    }
  }

  // Allow nudging the window with the keyboard when the title bar has focus.
  function onTitleKey(e: React.KeyboardEvent) {
    if (maximized) return;
    const step = 16;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      setBox((b) => ({ ...b, x: Math.max(0, b.x + move[0]), y: Math.max(0, b.y + move[1]) }));
    }
  }

  const entry = reference[selected];

  return (
    <div
      role="dialog"
      aria-label="SQL command reference"
      className={`fixed flex flex-col overflow-hidden rounded-xl border bg-white shadow-2xl dark:bg-slate-900 ${
        pinned ? 'z-[60] border-brand-500' : 'z-[55] border-slate-300 dark:border-slate-700'
      }`}
      style={style}
    >
      <div
        className="flex cursor-move items-center justify-between gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
        onPointerDown={startDrag}
        onKeyDown={onTitleKey}
        tabIndex={0}
        role="toolbar"
        aria-label="Reference window controls. Use arrow keys to move."
      >
        <span className="text-sm font-semibold">SQL Reference</span>
        <div className="flex items-center gap-1">
          <WinButton label={pinned ? 'Unpin' : 'Pin'} pressed={pinned} onClick={() => setPinned((p) => !p)}>
            Pin
          </WinButton>
          <WinButton label="Minimize" onClick={() => setMinimized((m) => !m)}>
            {minimized ? 'Show' : '_'}
          </WinButton>
          <WinButton label={maximized ? 'Restore' : 'Maximize'} onClick={toggleMaximize}>
            {maximized ? 'Restore' : 'Max'}
          </WinButton>
          <WinButton label="Close" onClick={onClose}>
            X
          </WinButton>
        </div>
      </div>

      {!minimized && (
        <div className="grid flex-1 grid-cols-[150px_1fr] overflow-hidden">
          <ul className="overflow-y-auto border-r border-slate-200 p-2 dark:border-slate-800" aria-label="Commands">
            {reference.map((r, i) => (
              <li key={r.command}>
                <button
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-current={i === selected}
                  className={`mb-1 w-full rounded-md px-2 py-1.5 text-left text-sm ${
                    i === selected
                      ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {r.command}
                </button>
              </li>
            ))}
          </ul>

          <div className="overflow-y-auto p-3 text-sm">
            <h3 className="text-base font-semibold">{entry.command}</h3>
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{entry.category}</p>
            <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-2 text-xs text-slate-100">
              <code>{entry.syntax}</code>
            </pre>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{entry.explanation}</p>
            <p className="mt-3 font-medium">Example</p>
            <pre className="mt-1 overflow-x-auto rounded bg-slate-900 p-2 text-xs text-slate-100">
              <code>{entry.example}</code>
            </pre>
            <p className="mt-3 font-medium">Common mistakes</p>
            <ul className="mt-1 list-disc pl-5 text-slate-600 dark:text-slate-300">
              {entry.commonMistakes.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
            <p className="mt-3 rounded-md bg-amber-50 p-2 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Try it: {entry.miniExercise}
            </p>
          </div>
        </div>
      )}

      {!minimized && !maximized && (
        <div
          role="separator"
          aria-label="Resize"
          onPointerDown={(e) => {
            resizeRef.current = { sx: e.clientX, sy: e.clientY, sw: box.w, sh: box.h };
          }}
          className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
          style={{
            background:
              'linear-gradient(135deg, transparent 50%, rgba(100,116,139,0.6) 50%)',
          }}
        />
      )}
    </div>
  );
}

function WinButton({
  children,
  label,
  pressed,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  pressed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded px-2 py-0.5 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 ${
        pressed ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200' : ''
      }`}
    >
      {children}
    </button>
  );
}
