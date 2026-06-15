import { useEffect, useRef } from 'react';
import { useSettings, type FontScale } from '../app/SettingsProvider';
import { useProgress } from '../features/progress/store';
import type { ProviderId } from '../lib/ai/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FONT_OPTIONS: { value: FontScale; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

// A focus-managed dialog for accessibility and display preferences. Closes on
// Escape and returns focus to the trigger.
export function SettingsPanel({ open, onClose }: Props) {
  const { settings, update } = useSettings();
  const aiConfig = useProgress((s) => s.aiConfig);
  const setAiConfig = useProgress((s) => s.setAiConfig);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Display and accessibility settings"
        tabIndex={-1}
        className="relative h-full w-full max-w-sm overflow-y-auto bg-white p-6 shadow-xl outline-none dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium">Text size</legend>
          <div className="mt-2 flex gap-2" role="group" aria-label="Text size">
            {FONT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={settings.fontScale === opt.value}
                onClick={() => update({ fontScale: opt.value })}
                className={`flex-1 rounded-md border px-3 py-2 text-sm ${
                  settings.fontScale === opt.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                    : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 space-y-3">
          <Toggle
            label="High contrast"
            description="Stronger borders and text contrast."
            checked={settings.highContrast}
            onChange={(v) => update({ highContrast: v })}
          />
          <Toggle
            label="Reduce motion"
            description="Minimise animations and transitions."
            checked={settings.reducedMotion}
            onChange={(v) => update({ reducedMotion: v })}
          />
          <Toggle
            label="Colorblind-friendly"
            description="Use shapes and labels, not colour alone, for status."
            checked={settings.colorblind}
            onChange={(v) => update({ colorblind: v })}
          />
          <Toggle
            label="Dyslexia-friendly text"
            description="Wider spacing and a more legible font."
            checked={settings.dyslexia}
            onChange={(v) => update({ dyslexia: v })}
          />
        </div>

        <fieldset className="mt-8 border-t border-slate-200 pt-4 dark:border-slate-800">
          <legend className="text-sm font-semibold">AI mentor</legend>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The mentor works without a key using the built-in lessons. Add a free-tier key to enable a
            hosted model. Keys are stored only in this browser.
          </p>

          <label className="mt-3 block text-sm">
            Provider
            <select
              value={aiConfig.provider}
              onChange={(e) => setAiConfig({ provider: e.target.value as ProviderId })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="offline">Built-in (no key)</option>
              <option value="gemini">Gemini Flash</option>
              <option value="groq">Groq (Llama/Qwen)</option>
            </select>
          </label>

          <label className="mt-3 block text-sm">
            Gemini API key
            <input
              type="password"
              value={aiConfig.geminiKey ?? ''}
              onChange={(e) => setAiConfig({ geminiKey: e.target.value })}
              placeholder="AI… (from Google AI Studio)"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
            />
          </label>

          <label className="mt-3 block text-sm">
            Groq API key
            <input
              type="password"
              value={aiConfig.groqKey ?? ''}
              onChange={(e) => setAiConfig({ groqKey: e.target.value })}
              placeholder="gsk_… (from console.groq.com)"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
            />
          </label>

          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={aiConfig.autoRoute}
              onChange={(e) => setAiConfig({ autoRoute: e.target.checked })}
            />
            Auto-route to the best provider per task
          </label>
        </fieldset>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-[22px]' : ''
          }`}
        />
      </button>
    </label>
  );
}
