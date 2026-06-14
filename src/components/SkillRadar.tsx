interface Axis {
  label: string;
  value: number; // 0..1
}

interface Props {
  axes: Axis[];
  size?: number;
}

// A lightweight radar chart drawn directly as SVG. Each axis is a topic
// category and the value is how much of it the learner has completed.
export function SkillRadar({ axes, size = 260 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40;
  const n = Math.max(axes.length, 3);

  const pointAt = (i: number, r: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r] as const;
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const valuePoints = axes
    .map((a, i) => pointAt(i, radius * Math.min(1, Math.max(0, a.value))).join(','))
    .join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Skill coverage by category">
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={axes.map((_, i) => pointAt(i, radius * ring).join(',')).join(' ')}
          fill="none"
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth="1"
        />
      ))}
      {axes.map((a, i) => {
        const [x, y] = pointAt(i, radius);
        const [lx, ly] = pointAt(i, radius + 18);
        return (
          <g key={a.label}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-500 text-[10px]"
            >
              {a.label}
            </text>
          </g>
        );
      })}
      <polygon points={valuePoints} fill="rgba(52,120,246,0.35)" stroke="#3478f6" strokeWidth="2" />
    </svg>
  );
}
