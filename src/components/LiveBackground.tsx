import { useEffect, useRef } from 'react';
import { useTheme } from '../app/ThemeProvider';
import { useSettings } from '../app/SettingsProvider';
import { VIBRANT, withAlpha } from '../lib/palette';

// A live constellation backdrop: drifting points connected by faint lines, a
// quiet nod to a knowledge graph and to the geometric star motif. It sits behind
// everything at low opacity so it adds depth and motion without hurting
// readability, and it goes completely still when reduced motion is requested.
export function LiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const { settings } = useSettings();

  useEffect(() => {
    const maybeCanvas = canvasRef.current;
    if (!maybeCanvas) return;
    const ctx = maybeCanvas.getContext('2d');
    if (!ctx) return;
    // Non-null aliases so the narrowing survives inside the closures below.
    const cv = maybeCanvas;
    const c = ctx;

    const dark = theme === 'dark';
    const line = dark ? 'rgba(148,163,184,0.16)' : 'rgba(100,116,139,0.12)';
    const dotAlpha = dark ? 0.7 : 0.5;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    interface P {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
    }
    let points: P[] = [];

    function seed() {
      // Density scales with area but is capped so it stays light on the CPU.
      const count = Math.min(70, Math.floor((width * height) / 26000));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        // Each point carries its own vibrant hue so the field is multi-colour.
        color: withAlpha(VIBRANT[Math.floor(Math.random() * VIBRANT.length)], dotAlpha),
      }));
    }

    function resize() {
      // The canvas is fixed and full-screen, so size it to the viewport. Reading
      // clientWidth can be 0 before layout settles, which would blank it out.
      width = window.innerWidth;
      height = window.innerHeight;
      cv.width = width * dpr;
      cv.height = height * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function draw() {
      c.clearRect(0, 0, width, height);
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }
      for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        c.fillStyle = a.color;
        c.beginPath();
        c.arc(a.x, a.y, 2, 0, Math.PI * 2);
        c.fill();
        for (let j = i + 1; j < points.length; j += 1) {
          const b = points[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            c.strokeStyle = line;
            c.globalAlpha = 1 - d / 130;
            c.beginPath();
            c.moveTo(a.x, a.y);
            c.lineTo(b.x, b.y);
            c.stroke();
            c.globalAlpha = 1;
          }
        }
      }
    }

    resize();
    window.addEventListener('resize', resize);

    // Honour reduced motion: draw a single static frame and stop.
    if (settings.reducedMotion) {
      draw();
      return () => window.removeEventListener('resize', resize);
    }

    let raf = 0;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [theme, settings.reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-70"
    />
  );
}
