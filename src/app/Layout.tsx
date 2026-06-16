import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Suspense, useEffect, useRef, useState } from 'react';
import {
  Network,
  Briefcase,
  Dumbbell,
  BarChart3,
  ChevronDown,
  BookMarked,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Flame,
  Zap,
  Search,
  Compass,
  X,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useProgress, levelFromXp } from '../features/progress/store';
import { BrandMark } from '../components/BrandMark';
import { SettingsPanel } from '../components/SettingsPanel';
import { ReferenceWindow } from '../features/reference/ReferenceWindow';
import { Loading } from '../components/Loading';
import { Badge, IconButton } from '../components/ui';
import { CommandPalette } from '../components/CommandPalette';
import { MentorPanel } from '../features/mentor/MentorPanel';

// Primary navigation is deliberately short: the four destinations that map to how
// a learner actually moves (explore, do real work, practise, track growth).
// Everything else lives under More so the header stays calm.
const primaryNav = [
  { to: '/tree', label: 'Tree', icon: Network },
  { to: '/missions', label: 'Missions', icon: Briefcase },
  { to: '/learn', label: 'Practice', icon: Dumbbell },
  { to: '/dashboard', label: 'Progress', icon: BarChart3 },
];

const moreNav = [
  { to: '/playground', label: 'Playground' },
  { to: '/mentor', label: 'Mentor' },
  { to: '/review', label: 'Review' },
  { to: '/paths', label: 'Learning paths' },
  { to: '/bookmarks', label: 'Bookmarks' },
  { to: '/courses', label: 'Courses' },
  { to: '/certificate', label: 'Certificate' },
];

export function Layout() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streakCount);
  const registerActivity = useProgress((s) => s.registerActivity);
  const { level } = levelFromXp(xp);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);

  // The command palette shortcut is owned here so the search button and
  // Cmd/Ctrl+K open the same thing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Pulse the XP badge when experience increases, so earning points has a moment.
  const [xpPulse, setXpPulse] = useState(false);
  const prevXp = useRef(xp);
  useEffect(() => {
    if (xp > prevXp.current) {
      setXpPulse(true);
      const t = setTimeout(() => setXpPulse(false), 450);
      prevXp.current = xp;
      return () => clearTimeout(t);
    }
    prevXp.current = xp;
  }, [xp]);

  useEffect(() => {
    registerActivity();
  }, [registerActivity]);

  // Close the More menu on navigation.
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <NavLink to="/" aria-label="Mizan home" className="shrink-0">
            <BrandMark />
          </NavLink>

          <nav className="ml-2 flex flex-1 items-center gap-1" aria-label="Primary">
            {primaryNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                <item.icon size={16} aria-hidden="true" />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}

            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                More <ChevronDown size={14} aria-hidden="true" />
              </button>
              {moreOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-1 w-44 animate-fade-in rounded-xl bg-white p-1 shadow-float dark:bg-slate-900"
                >
                  {moreNav.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      role="menuitem"
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-2 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 lg:flex"
            >
              <Search size={15} aria-hidden="true" />
              <span>Search</span>
              <kbd className="rounded border border-slate-300 px-1 text-[10px] dark:border-slate-600">⌘K</kbd>
            </button>
            <Badge tone="accent" className="hidden md:inline-flex">
              <Flame size={13} aria-hidden="true" /> {streak}
            </Badge>
            <Badge tone="brand" className={`hidden md:inline-flex ${xpPulse ? 'animate-pop' : ''}`}>
              <Zap size={13} aria-hidden="true" /> Lv {level} · {xp}
            </Badge>
            <IconButton label="AI Navigator" pressed={navigatorOpen} onClick={() => setNavigatorOpen((v) => !v)}>
              <Compass size={18} />
            </IconButton>
            <IconButton label="SQL reference" pressed={referenceOpen} onClick={() => setReferenceOpen((v) => !v)}>
              <BookMarked size={18} />
            </IconButton>
            <IconButton label="Settings" onClick={() => setSettingsOpen(true)}>
              <SettingsIcon size={18} />
            </IconButton>
            <IconButton
              label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              onClick={toggle}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Suspense fallback={<Loading />}>
          {/* Keying on the path replays a short enter transition between routes,
              so navigation feels like movement rather than a hard page swap. */}
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 px-4 py-6 text-center text-xs text-slate-500 dark:border-slate-800">
        Mizan runs entirely in your browser. Your progress is saved locally on this device.
      </footer>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ReferenceWindow open={referenceOpen} onClose={() => setReferenceOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Always-available AI Navigator: a slide-in sidebar on any page. */}
      {navigatorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
          <div className="absolute inset-0 bg-black/30" onClick={() => setNavigatorOpen(false)} aria-hidden="true" />
          <aside
            role="dialog"
            aria-label="AI Navigator"
            className="relative flex h-full w-full max-w-md animate-fade-in flex-col bg-white shadow-float dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <span className="flex items-center gap-2 font-semibold">
                <Compass size={18} /> Navigator
              </span>
              <IconButton label="Close Navigator" onClick={() => setNavigatorOpen(false)}>
                <X size={18} />
              </IconButton>
            </div>
            <div className="min-h-0 flex-1">
              <MentorPanel />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
