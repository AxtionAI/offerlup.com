import { conditionTiers } from "@/lib/validation";

const TIER_ICON: Record<string, string> = {
  NEEDS_FULL_REHAB: "🛠️",
  NEEDS_MODERATE_WORK: "🧰",
  LIGHT_COSMETIC: "🎨",
  MOVE_IN_READY: "✨",
};

export function ConditionPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {conditionTiers.map((tier) => {
        const selected = value === tier.value;
        return (
          <button
            type="button"
            key={tier.value}
            onClick={() => onChange(tier.value)}
            className={`flex flex-col items-start rounded-xl border-2 p-4 text-left transition ${
              selected ? "border-brand-600 bg-brand-50" : "border-ink-100 hover:border-ink-200"
            }`}
          >
            <span className="text-2xl">{TIER_ICON[tier.value]}</span>
            <span className="mt-2 text-sm font-bold text-ink-900">{tier.title}</span>
            <span className="mt-0.5 text-xs text-ink-500">{tier.description}</span>
          </button>
        );
      })}
    </div>
  );
}
