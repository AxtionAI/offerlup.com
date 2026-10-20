export function AuctionIllustration({ className }: { className?: string }) {
  const bars = [
    { x: 60, h: 70, color: "var(--color-ink-700)" },
    { x: 140, h: 110, color: "var(--color-brand-500)" },
    { x: 220, h: 150, color: "var(--color-brand-300)" },
    { x: 300, h: 190, color: "var(--color-cash-400)" },
  ];
  const baseline = 300;

  return (
    <svg viewBox="0 0 480 360" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="360" rx="24" fill="var(--color-ink-950)" />

      {/* rising bid bars */}
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={baseline - b.h} width="56" height={b.h} rx="6" fill={b.color} />
      ))}

      {/* bid tags floating above the tallest bars */}
      <g>
        <rect x="190" y="70" width="80" height="34" rx="17" fill="var(--color-brand-100)" />
        <text x="230" y="92" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--color-brand-700)">
          +$2.5K
        </text>
      </g>
      <g>
        <rect x="270" y="30" width="86" height="34" rx="17" fill="var(--color-cash-100)" />
        <text x="313" y="52" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--color-cash-700)">
          Leading
        </text>
      </g>

      {/* baseline */}
      <line x1="40" y1={baseline} x2="440" y2={baseline} stroke="var(--color-ink-700)" strokeWidth="3" />

      {/* small property icon, bottom-left, representing the deal being bid on */}
      <g transform="translate(60,318)">
        <rect x="0" y="0" width="34" height="22" fill="var(--color-ink-800)" stroke="var(--color-ink-500)" strokeWidth="2" />
        <path d="M-4 0 L17 -14 L38 0" stroke="var(--color-ink-500)" strokeWidth="2" fill="none" />
      </g>
      <text x="140" y="334" fontSize="13" fill="var(--color-ink-400)">
        118 Cactus Wren Rd · 3 bidders competing
      </text>
    </svg>
  );
}
