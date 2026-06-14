import { NavLink, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { useProgress, levelFromXp } from '../features/progress/store';

const navItems = [
  { to: '/', label: 'Roadmap', end: true },
  { to: '/playground', label: 'Playground' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/certificate', label: 'Certificate' },
];

export function Layout() {
  const { theme, toggle } = useTheme();
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streakCount);
  const registerActivity = useProgress((s) => s.registerActivity);
  const { level } = levelFromXp(xp);

  // Visiting the app at least once a day counts toward the streak.
  useEffect(() => {
    registerActivity();
  }, [registerActivity]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-mono text-white">
              SQL
            </span>
            <span className="hidden sm:inline">Mastery</span>
          </NavLink>

          <nav className="flex flex-1 items-center gap-1 overflow-x-auto" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
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

          <div className="flex items-center gap-3 text-sm">
            <span
              className="hidden items-center gap-1 rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 sm:flex"
              title="Daily streak"
            >
              {streak} day{streak === 1 ? '' : 's'}
            </span>
            <span
              className="hidden items-center gap-1 rounded-full bg-brand-100 px-2 py-1 font-medium text-brand-800 dark:bg-brand-900/40 dark:text-brand-200 sm:flex"
              title="Experience and level"
            >
              Lv {level} · {xp} XP
            </span>
            <button
              type="button"
              onClick={toggle}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 px-4 py-6 text-center text-xs text-slate-500 dark:border-slate-800">
        SQL Mastery runs entirely in your browser. Your progress is saved locally on this device.
      </footer>
    </div>
  );
}
