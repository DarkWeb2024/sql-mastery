import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useSettings } from '../app/SettingsProvider';

const TRANSITION = 'opacity 0.7s cubic-bezier(0.2,0,0,1), transform 0.7s cubic-bezier(0.2,0,0,1)';

// Reveal-on-scroll wrapper for the landing page. It is visible by default and
// only hides elements that are genuinely below the fold so they can animate in
// as you scroll. Because the default is visible, content can never get stuck
// invisible if the viewport size is unknown or the observer misbehaves.
export function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'header';
}) {
  const { settings } = useSettings();
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || settings.reducedMotion) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const vh = window.innerHeight;
    if (!vh) return; // unknown viewport: leave everything visible
    if (el.getBoundingClientRect().top < vh) return; // already in view: stay visible
    // Below the fold: hide (off-screen, so no visible flash) then reveal on scroll.
    setHidden(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHidden(false);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [settings.reducedMotion]);

  const style: CSSProperties = settings.reducedMotion
    ? {}
    : {
        opacity: hidden ? 0 : 1,
        transform: hidden ? 'translateY(28px)' : 'none',
        transition: TRANSITION,
        transitionDelay: `${delay}ms`,
      };

  return (
    <Tag ref={ref as never} className={className} style={style}>
      {children}
    </Tag>
  );
}
