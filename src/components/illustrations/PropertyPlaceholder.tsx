const PALETTES = [
  { sky: "var(--color-cream-100)", house: "var(--color-brand-600)", roof: "var(--color-brand-700)", accent: "var(--color-cash-400)" },
  { sky: "var(--color-brand-50)", house: "var(--color-brand-500)", roof: "var(--color-brand-700)", accent: "var(--color-cream-300)" },
  { sky: "var(--color-cash-50)", house: "var(--color-ink-700)", roof: "var(--color-brand-600)", accent: "var(--color-cash-500)" },
];

/** Deterministic variant so the same property always renders the same illustration. */
function paletteFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTES[hash % PALETTES.length];
}

export function PropertyPlaceholder({ seed, className }: { seed: string; className?: string }) {
  const p = paletteFor(seed);
  return (
    <svg viewBox="0 0 400 240" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="240" fill={p.sky} />
      <circle cx="340" cy="50" r="22" fill={p.accent} opacity="0.5" />
      <path d="M0 190 L400 190 L400 240 L0 240 Z" fill="white" opacity="0.4" />

      <path d="M90 190 L200 110 L310 190 Z" fill={p.roof} />
      <rect x="110" y="190" width="180" height="80" fill="white" stroke={p.house} strokeWidth="4" />
      <rect x="188" y="222" width="24" height="48" fill={p.house} />
      <rect x="130" y="206" width="26" height="26" fill={p.sky} stroke={p.house} strokeWidth="2.5" />
      <rect x="244" y="206" width="26" height="26" fill={p.sky} stroke={p.house} strokeWidth="2.5" />

      <text x="20" y="225" fontSize="11" fill={p.house} opacity="0.65" fontWeight="600" letterSpacing="0.5">
        ILLUSTRATIVE PROPERTY
      </text>
    </svg>
  );
}
