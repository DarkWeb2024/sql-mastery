import { NavLink, Outlet } from 'react-router-dom';
import { Suspense, useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { useProgress, levelFromXp } from '../features/progress/store';
import { BrandMark } from '../components/BrandMark';
import { SettingsPanel } from '../components/SettingsPanel';
import { ReferenceWindow } from '../features/reference/ReferenceWindow';
import { Loading } from '../components/Loading';

const navItems = [
  { to: '/tree', label: 'Tree' },
  { to: '/learn', label: 'Smart Practice' },
  { to: '/mentor', label: 'Mentor' },
  { to: '/playground', label: 'Playground' },
  { to: '/review', label: 'Review' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/courses', label: 'Courses' },
  { to: '/certificate', label: 'Certificate' },
];

export function Layout() {
  const { theme, toggle } = useTheme();
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streakCount);
  const registerActivity = useProgress((s) => s.registerActivity);
  const { level } = levelFromXp(xp);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);

  useEffect(() => {
    registerActivity();
  }, [registerActivity]);

  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <NavLink to="/" aria-label="Khwarizmi home" className="shrink-0">
            <BrandMark />
          </NavLink>

          <nav className="flex flex-1 items-center gap-1 overflow-x-auto" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 text-sm">
            <span
              className="hidden items-center gap-1 rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 md:flex"
              title="Daily streak"
            >
              {streak}d
            </span>
            <span
              className="hidden items-center gap-1 rounded-full bg-brand-100 px-2 py-1 font-medium text-brand-800 dark:bg-brand-900/40 dark:text-brand-200 md:flex"
              title="Experience and level"
            >
              Lv {level} · {xp} XP
            </span>
            <button
              type="button"
              onClick={() => setReferenceOpen((v) => !v)}
              aria-pressed={referenceOpen}
              className="rounded-md border border-slate-300 px-2 py-1.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Reference
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="rounded-md border border-slate-300 px-2 py-1.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={toggle}
              className="rounded-md border border-slate-300 px-2 py-1.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 px-4 py-6 text-center text-xs text-slate-500 dark:border-slate-800">
        Khwarizmi runs entirely in your browser. Your progress is saved locally on this device.
      </footer>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ReferenceWindow open={referenceOpen} onClose={() => setReferenceOpen(false)} />
    </div>
  );
}
