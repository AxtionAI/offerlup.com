"use client";

import { useEffect, useState } from "react";
import { propertyTypeOptions, conditionOptions, featureOptionGroups } from "@/lib/validation";

type Market = { label: string; city: string; county: string; state: string; zip: string };
type BuyBox = {
  id: string;
  name: string;
  active: boolean;
  propertyTypes: string;
  conditions: string;
  minPrice: number | null;
  maxPrice: number | null;
  markets: { id: string; label: string }[];
};

const emptyMarket: Market = { label: "", city: "", county: "", state: "", zip: "" };

export default function BuyBoxPage() {
  const [buyBoxes, setBuyBoxes] = useState<BuyBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [types, setTypes] = useState<string[]>(["SINGLE_FAMILY"]);
  const [conditions, setConditions] = useState<string[]>(["NEEDS_FULL_REHAB", "NEEDS_MODERATE_WORK"]);
  const [markets, setMarkets] = useState<Market[]>([{ ...emptyMarket }]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [minGarageSpaces, setMinGarageSpaces] = useState("");
  const [requiresPool, setRequiresPool] = useState(false);
  const [desiredFeatures, setDesiredFeatures] = useState<string[]>([]);

  async function load() {
    const res = await fetch("/api/buy-box");
    if (res.ok) {
      const data = await res.json();
      setBuyBoxes(data.buyBoxes);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function toggleType(v: string) {
    setTypes((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]));
  }
  function toggleCondition(v: string) {
    setConditions((c) => (c.includes(v) ? c.filter((x) => x !== v) : [...c, v]));
  }
  function toggleFeature(v: string) {
    setDesiredFeatures((f) => (f.includes(v) ? f.filter((x) => x !== v) : [...f, v]));
  }
  function updateMarket(i: number, patch: Partial<Market>) {
    setMarkets((ms) => ms.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/buy-box", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "My Buy Box",
          propertyTypes: types,
          conditions,
          markets: markets
            .filter((m) => m.city || m.county || m.zip || m.state)
            .map((m) => ({ ...m, label: m.label || m.city || m.county || m.zip || m.state })),
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          minBedrooms: minBedrooms || undefined,
          minGarageSpaces: minGarageSpaces || undefined,
          requiresPool,
          desiredFeatures,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save buy box");
      setShowForm(false);
      setName("");
      setMarkets([{ ...emptyMarket }]);
      setMinGarageSpaces("");
      setRequiresPool(false);
      setDesiredFeatures([]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/buy-box/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/buy-box/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Smart Buy Box</h1>
          <p className="text-sm text-ink-500">Target markets and criteria we use to match and score deals for you.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {showForm ? "Cancel" : "+ New Buy Box"}
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Buy Box Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maricopa County SFR Flips"
              className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <div className="mt-5">
            <span className="mb-2 block text-sm font-medium text-ink-700">Target Markets</span>
            <div className="space-y-3">
              {markets.map((m, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 rounded-lg bg-ink-50 p-3 sm:grid-cols-4">
                  <input placeholder="City" value={m.city} onChange={(e) => updateMarket(i, { city: e.target.value })} className="rounded-md border border-ink-200 px-2.5 py-1.5 text-sm" />
                  <input placeholder="County" value={m.county} onChange={(e) => updateMarket(i, { county: e.target.value })} className="rounded-md border border-ink-200 px-2.5 py-1.5 text-sm" />
                  <input placeholder="State (AZ)" maxLength={2} value={m.state} onChange={(e) => updateMarket(i, { state: e.target.value.toUpperCase() })} className="rounded-md border border-ink-200 px-2.5 py-1.5 text-sm" />
                  <input placeholder="ZIP" value={m.zip} onChange={(e) => updateMarket(i, { zip: e.target.value })} className="rounded-md border border-ink-200 px-2.5 py-1.5 text-sm" />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMarkets((ms) => [...ms, { ...emptyMarket }])}
              className="mt-2 text-sm font-semibold text-brand-600"
            >
              + Add another market
            </button>
          </div>

          <div className="mt-5">
            <span className="mb-2 block text-sm font-medium text-ink-700">Property Types</span>
            <div className="flex flex-wrap gap-2">
              {propertyTypeOptions.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggleType(o.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    types.includes(o.value) ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-500"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <span className="mb-2 block text-sm font-medium text-ink-700">Condition</span>
            <div className="flex flex-wrap gap-2">
              {conditionOptions.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggleCondition(o.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    conditions.includes(o.value) ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-500"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">Min Price</span>
              <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">Max Price</span>
              <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">Min Bedrooms</span>
              <input value={minBedrooms} onChange={(e) => setMinBedrooms(e.target.value)} type="number" className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">Min Garage Spaces</span>
              <input value={minGarageSpaces} onChange={(e) => setMinGarageSpaces(e.target.value)} type="number" className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
            </label>
            <label className="flex items-end pb-2.5">
              <button
                type="button"
                onClick={() => setRequiresPool((v) => !v)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                  requiresPool ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-500"
                }`}
              >
                🏊 Must have a pool
              </button>
            </label>
          </div>

          <div className="mt-5">
            <span className="mb-2 block text-sm font-medium text-ink-700">Preferred Features (boosts match score)</span>
            <div className="space-y-3">
              {featureOptionGroups.map((group) => (
                <div key={group.group}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">{group.group}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => toggleFeature(o.value)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                          desiredFeatures.includes(o.value)
                            ? "border-brand-600 bg-brand-50 text-brand-700"
                            : "border-ink-200 text-ink-500"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save Buy Box"}
          </button>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-ink-400">Loading…</p>
        ) : buyBoxes.length === 0 && !showForm ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center text-ink-500">
            No buy boxes yet. Create one so we can match and score deals for you.
          </div>
        ) : (
          buyBoxes.map((bb) => (
            <div key={bb.id} className="rounded-2xl border border-ink-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-ink-900">{bb.name}</p>
                  <p className="text-sm text-ink-500">
                    {bb.markets.map((m) => m.label).join(", ") || "No markets set"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${bb.active ? "bg-cash-100 text-cash-700" : "bg-ink-100 text-ink-500"}`}>
                    {bb.active ? "Active" : "Paused"}
                  </span>
                  <button onClick={() => toggleActive(bb.id, bb.active)} className="text-sm font-semibold text-brand-600">
                    {bb.active ? "Pause" : "Activate"}
                  </button>
                  <button onClick={() => remove(bb.id)} className="text-sm font-semibold text-red-600">
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(JSON.parse(bb.propertyTypes) as string[]).map((t) => (
                  <span key={t} className="rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-600">
                    {t.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
