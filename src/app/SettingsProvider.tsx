import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { readJson, writeJson } from '../lib/storage';

export type FontScale = 'sm' | 'md' | 'lg';

export interface Settings {
  fontScale: FontScale;
  highContrast: boolean;
  reducedMotion: boolean;
  colorblind: boolean;
}

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

const STORAGE_KEY = 'khwarizmi-settings';

const defaults: Settings = {
  fontScale: 'md',
  highContrast: false,
  // Seed reduced motion from the OS preference so we respect it out of the box.
  reducedMotion:
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  colorblind: false,
};

const FONT_PX: Record<FontScale, string> = { sm: '15px', md: '16px', lg: '18px' };

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => ({
    ...defaults,
    ...readJson<Partial<Settings>>(STORAGE_KEY, {}),
  }));

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = FONT_PX[settings.fontScale];
    root.classList.toggle('hc', settings.highContrast);
    root.classList.toggle('reduce-motion', settings.reducedMotion);
    root.classList.toggle('cb', settings.colorblind);
    writeJson(STORAGE_KEY, settings);
  }, [settings]);

  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));

  return (
    <SettingsContext.Provider value={{ settings, update }}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
