export function WizardStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full ${i <= current ? "bg-brand-600" : "bg-ink-100"}`} />
        ))}
      </div>
      <div className="mt-2 grid gap-1 text-xs font-semibold" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((label, i) => (
          <span key={label} className={i === current ? "text-brand-700" : i < current ? "text-ink-500" : "text-ink-300"}>
            {i + 1}. {label}
          </span>
        ))}
      </div>
    </div>
  );
}
