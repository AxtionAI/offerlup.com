export function KeyHandoverIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 360" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="360" rx="24" fill="var(--color-cream-200)" />

      {/* house in the background */}
      <g opacity="0.9">
        <rect x="150" y="150" width="180" height="110" fill="white" stroke="var(--color-brand-600)" strokeWidth="4" />
        <path d="M140 160 L240 90 L340 160" stroke="var(--color-brand-600)" strokeWidth="4" strokeLinejoin="round" fill="none" />
        <rect x="225" y="190" width="30" height="70" fill="var(--color-brand-300)" />
        <rect x="170" y="175" width="28" height="28" fill="var(--color-brand-100)" stroke="var(--color-brand-600)" strokeWidth="2.5" />
        <rect x="282" y="175" width="28" height="28" fill="var(--color-brand-100)" stroke="var(--color-brand-600)" strokeWidth="2.5" />
      </g>

      {/* ground line */}
      <line x1="40" y1="260" x2="440" y2="260" stroke="var(--color-brand-200)" strokeWidth="3" />

      {/* left figure (seller) */}
      <g>
        <circle cx="165" cy="235" r="16" fill="var(--color-brand-600)" />
        <path d="M145 320 C145 280 150 265 165 251 C180 265 185 280 185 320 Z" fill="var(--color-brand-600)" />
        <path d="M165 255 L195 240" stroke="var(--color-brand-600)" strokeWidth="10" strokeLinecap="round" />
      </g>

      {/* right figure (investor) */}
      <g>
        <circle cx="325" cy="235" r="16" fill="var(--color-brand-400)" />
        <path d="M305 320 C305 280 310 265 325 251 C340 265 345 280 345 320 Z" fill="var(--color-brand-400)" />
        <path d="M325 255 L295 240" stroke="var(--color-brand-400)" strokeWidth="10" strokeLinecap="round" />
      </g>

      {/* key passing between hands */}
      <g transform="translate(228,228) rotate(20)">
        <circle cx="0" cy="0" r="9" fill="none" stroke="var(--color-cash-600)" strokeWidth="5" />
        <rect x="8" y="-3" width="26" height="6" fill="var(--color-cash-600)" />
        <rect x="28" y="3" width="6" height="8" fill="var(--color-cash-600)" />
        <rect x="18" y="3" width="6" height="6" fill="var(--color-cash-600)" />
      </g>

      {/* sparkle accents */}
      <circle cx="90" cy="100" r="5" fill="var(--color-cash-400)" />
      <circle cx="400" cy="120" r="4" fill="var(--color-brand-300)" />
      <circle cx="410" cy="220" r="6" fill="var(--color-cash-400)" />
    </svg>
  );
}
