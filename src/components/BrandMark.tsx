interface Props {
  withWordmark?: boolean;
  size?: number;
}

// An eight-point geometric star, a motif rooted in Islamic art, used as the
// Mizan mark. Drawn inline as SVG so there is no image asset to load.
export function BrandMark({ withWordmark = true, size = 32 }: Props) {
  return (
    <span className="flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        role="img"
        aria-label="Mizan"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="khwarizmi-star" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3478f6" />
            <stop offset="100%" stopColor="#1a48b8" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="92" height="92" rx="20" fill="url(#khwarizmi-star)" />
        <g fill="none" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round">
          <rect x="28" y="28" width="44" height="44" transform="rotate(0 50 50)" />
          <rect x="28" y="28" width="44" height="44" transform="rotate(45 50 50)" />
        </g>
      </svg>
      {withWordmark && (
        <span className="text-lg font-bold tracking-tight">Mizan</span>
      )}
    </span>
  );
}
