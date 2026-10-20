"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { propertyTypeOptions, conditionTiers, challengeOptions, featureOptionGroups } from "@/lib/validation";
import { estimateOfferRange, formatCurrency } from "@/lib/offer";
import { WizardStepper } from "@/components/WizardStepper";
import { ConditionPicker } from "@/components/ConditionPicker";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

type FormState = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  propertyType: string;
  condition: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  yearBuilt: string;
  lotSizeSqft: string;
  stories: string;
  garageSpaces: string;
  hasPool: boolean;
  hasHoa: boolean;
  hoaFeeMonthly: string;
  features: string[];
  zillowEstimate: string;
  askingPrice: string;
  occupancy: string;
  challenges: string[];
  reasonForSelling: string;
  timelineToSell: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

const initialState: FormState = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zip: "",
  county: "",
  propertyType: "SINGLE_FAMILY",
  condition: "NEEDS_MODERATE_WORK",
  bedrooms: "3",
  bathrooms: "2",
  squareFeet: "1500",
  yearBuilt: "",
  lotSizeSqft: "",
  stories: "1",
  garageSpaces: "",
  hasPool: false,
  hasHoa: false,
  hoaFeeMonthly: "",
  features: [],
  zillowEstimate: "",
  askingPrice: "",
  occupancy: "Owner occupied",
  challenges: [],
  reasonForSelling: "",
  timelineToSell: "ASAP",
  fullName: "",
  email: "",
  phone: "",
  password: "",
};

const STEPS = ["The Property", "The Numbers", "Review & Submit"];

export default function SellPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [photos, setPhotos] = useState<{ url: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mortgagePayoff, setMortgagePayoff] = useState("");
  const [closingCosts, setClosingCosts] = useState("");

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const toggleChallenge = (v: string) =>
    setForm((f) => ({
      ...f,
      challenges: f.challenges.includes(v) ? f.challenges.filter((c) => c !== v) : [...f.challenges, v],
    }));

  const toggleFeature = (v: string) =>
    setForm((f) => ({
      ...f,
      features: f.features.includes(v) ? f.features.filter((c) => c !== v) : [...f.features, v],
    }));

  const offerRange = useMemo(() => {
    const zillow = Number(form.zillowEstimate);
    if (!zillow || zillow <= 0) return null;
    const tier = conditionTiers.find((t) => t.value === form.condition) ?? conditionTiers[1];
    return estimateOfferRange(zillow, tier.maxRehabPct);
  }, [form.zillowEstimate, form.condition]);

  const walkAway = useMemo(() => {
    const asking = Number(form.askingPrice) || offerRange?.high || 0;
    return asking - (Number(mortgagePayoff) || 0) - (Number(closingCosts) || 0);
  }, [form.askingPrice, offerRange, mortgagePayoff, closingCosts]);

  async function handlePhotoUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: { url: string; name: string }[] = [];
      for (const file of Array.from(files).slice(0, 10)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("subdir", "properties");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        uploaded.push({ url: data.url, name: file.name });
      }
      setPhotos((p) => [...p, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          photoUrls: photos.map((p) => p.url),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      router.push(`/seller/properties/${data.propertyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    setError(null);
    if (step === 0 && (!form.addressLine1 || !form.city || !form.state || !form.zip)) {
      setError("Fill in the full property address to continue.");
      return;
    }
    if (step === 1 && !form.zillowEstimate) {
      setError("Enter an estimated market value to continue.");
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function stepper(value: string, onChange: (v: string) => void, min = 0, max = 20, step_ = 1) {
    const n = Number(value) || 0;
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(String(Math.max(min, n - step_)))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-600 hover:bg-ink-50"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold text-ink-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(String(Math.min(max, n + step_)))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-600 hover:bg-ink-50"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-cream-50">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              OL
            </span>
            <span className="text-lg font-extrabold tracking-tight text-ink-900">OfferLift</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <WizardStepper steps={STEPS} current={step} />

        <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-8 shadow-sm">
          {step === 0 && (
            <section>
              <h1 className="text-2xl font-extrabold text-ink-900">Start with the property.</h1>
              <p className="mt-1 text-sm text-ink-500">The more we understand, the more useful your estimate will be.</p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Street Address" className="sm:col-span-2">
                  <AddressAutocomplete
                    className={inputCls}
                    value={form.addressLine1}
                    onChange={(v) => update({ addressLine1: v })}
                    onAddressSelect={(addr) =>
                      update({
                        addressLine1: addr.addressLine1 || form.addressLine1,
                        city: addr.city || form.city,
                        state: addr.state || form.state,
                        zip: addr.zip || form.zip,
                        county: addr.county || form.county,
                      })
                    }
                    placeholder="Start typing your address…"
                  />
                </Field>
                <Field label="Unit / Apt (optional)" className="sm:col-span-2">
                  <input className={inputCls} value={form.addressLine2} onChange={(e) => update({ addressLine2: e.target.value })} />
                </Field>
                <Field label="City">
                  <input className={inputCls} value={form.city} onChange={(e) => update({ city: e.target.value })} />
                </Field>
                <Field label="County (optional)">
                  <input className={inputCls} value={form.county} onChange={(e) => update({ county: e.target.value })} />
                </Field>
                <Field label="State">
                  <input className={inputCls} maxLength={2} value={form.state} onChange={(e) => update({ state: e.target.value.toUpperCase() })} placeholder="AZ" />
                </Field>
                <Field label="ZIP Code">
                  <input className={inputCls} value={form.zip} onChange={(e) => update({ zip: e.target.value })} />
                </Field>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Property Type" className="sm:col-span-2">
                  <select className={inputCls} value={form.propertyType} onChange={(e) => update({ propertyType: e.target.value })}>
                    {propertyTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Year Built (optional)">
                  <input type="number" className={inputCls} value={form.yearBuilt} onChange={(e) => update({ yearBuilt: e.target.value })} />
                </Field>
                <Field label="Square Feet">
                  <input type="number" className={inputCls} value={form.squareFeet} onChange={(e) => update({ squareFeet: e.target.value })} />
                </Field>
                <Field label="Bedrooms">{stepper(form.bedrooms, (v) => update({ bedrooms: v }))}</Field>
                <Field label="Bathrooms">{stepper(form.bathrooms, (v) => update({ bathrooms: v }), 0, 20, 0.5)}</Field>
                <Field label="Stories">{stepper(form.stories, (v) => update({ stories: v }), 1, 5)}</Field>
                <Field label="Garage Spaces">{stepper(form.garageSpaces || "0", (v) => update({ garageSpaces: v }), 0, 6)}</Field>
                <Field label="Lot Size (sqft, optional)">
                  <input type="number" className={inputCls} value={form.lotSizeSqft} onChange={(e) => update({ lotSizeSqft: e.target.value })} />
                </Field>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => update({ hasPool: !form.hasPool })}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                    form.hasPool ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-500"
                  }`}
                >
                  🏊 Has a pool
                </button>
                <button
                  type="button"
                  onClick={() => update({ hasHoa: !form.hasHoa })}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                    form.hasHoa ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-500"
                  }`}
                >
                  🏘️ Part of an HOA
                </button>
                {form.hasHoa && (
                  <input
                    type="number"
                    className={`${inputCls} w-40`}
                    placeholder="Monthly HOA fee"
                    value={form.hoaFeeMonthly}
                    onChange={(e) => update({ hoaFeeMonthly: e.target.value })}
                  />
                )}
              </div>

              <div className="mt-6">
                <span className="mb-2 block text-sm font-medium text-ink-700">Property features (optional)</span>
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
                              form.features.includes(o.value)
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
            </section>
          )}

          {step === 1 && (
            <section>
              <h1 className="text-2xl font-extrabold text-ink-900">Let&apos;s talk numbers.</h1>
              <p className="mt-1 text-sm text-ink-500">A realistic starting range — not a written offer.</p>

              <Field label="What's the home's estimated market value today?" className="mt-6">
                <input type="number" className={inputCls} value={form.zillowEstimate} onChange={(e) => update({ zillowEstimate: e.target.value })} placeholder="e.g. 350000" />
                <span className="mt-1 block text-xs text-ink-400">An estimate is fine — pull it from Zillow, Redfin, or your own sense of the market.</span>
              </Field>

              <div className="mt-6">
                <span className="mb-2 block text-sm font-medium text-ink-700">How would you describe the home&apos;s condition?</span>
                <ConditionPicker value={form.condition} onChange={(v) => update({ condition: v })} />
              </div>

              {offerRange && (
                <div className="mt-6 rounded-xl border border-cash-100 bg-cash-50 p-4">
                  <p className="text-xs font-semibold text-cash-700">ESTIMATED OFFER RANGE</p>
                  <p className="mt-1 text-2xl font-extrabold text-ink-900">
                    {formatCurrency(offerRange.low)} – {formatCurrency(offerRange.high)}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    Based on the lower of ARV-minus-rehab and 80% of market value. Not a written offer — our team
                    confirms exact numbers after reviewing your submission.
                  </p>
                </div>
              )}

              <div className="mt-6">
                <span className="mb-2 block text-sm font-medium text-ink-700">What challenges are you facing? (optional)</span>
                <div className="flex flex-wrap gap-2">
                  {challengeOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => toggleChallenge(o.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        form.challenges.includes(o.value) ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-500"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Occupancy">
                  <select className={inputCls} value={form.occupancy} onChange={(e) => update({ occupancy: e.target.value })}>
                    <option>Owner occupied</option>
                    <option>Tenant occupied</option>
                    <option>Vacant</option>
                    <option>Inherited / Estate</option>
                  </select>
                </Field>
                <Field label="Timeline to Sell">
                  <select className={inputCls} value={form.timelineToSell} onChange={(e) => update({ timelineToSell: e.target.value })}>
                    <option value="ASAP">As soon as possible</option>
                    <option value="30_DAYS">Within 30 days</option>
                    <option value="90_DAYS">Within 90 days</option>
                    <option value="FLEXIBLE">Flexible / just exploring</option>
                  </select>
                </Field>
                <Field label="Anything else we should understand? (optional)" className="sm:col-span-2">
                  <textarea className={inputCls} rows={3} value={form.reasonForSelling} onChange={(e) => update({ reasonForSelling: e.target.value })} placeholder="Condition, timing, or your goals." />
                </Field>
              </div>

              <h2 className="mt-8 text-lg font-bold text-ink-900">Add photos (optional)</h2>
              <p className="text-sm text-ink-500">Listings with photos get reviewed faster.</p>
              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 p-8 text-center hover:border-brand-400">
                <span className="text-sm font-medium text-ink-600">
                  {uploading ? "Uploading…" : "Click to upload photos"}
                </span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoUpload(e.target.files)} />
              </label>
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {photos.map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={p.url} src={p.url} alt={p.name} className="h-20 w-full rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </section>
          )}

          {step === 2 && (
            <section>
              <h1 className="text-2xl font-extrabold text-ink-900">Almost done.</h1>
              <p className="mt-1 text-sm text-ink-500">We&apos;ll create a free account so you can track your offer and auction activity.</p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full Name" className="sm:col-span-2">
                  <input className={inputCls} value={form.fullName} onChange={(e) => update({ fullName: e.target.value })} />
                </Field>
                <Field label="Email">
                  <input type="email" className={inputCls} value={form.email} onChange={(e) => update({ email: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <input className={inputCls} value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
                </Field>
                <Field label="Create a Password" className="sm:col-span-2">
                  <input type="password" className={inputCls} value={form.password} onChange={(e) => update({ password: e.target.value })} />
                </Field>
                <Field label="Your Asking Price (optional)">
                  <input type="number" className={inputCls} value={form.askingPrice} onChange={(e) => update({ askingPrice: e.target.value })} placeholder={offerRange ? String(offerRange.high) : undefined} />
                </Field>
              </div>

              <div className="mt-6 rounded-xl bg-ink-50 p-4">
                <p className="text-sm font-semibold text-ink-700">Quick walk-away estimate (optional, just for you)</p>
                <p className="text-xs text-ink-500">Not shared with investors — this is only to help you plan.</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Mortgage / liens payoff">
                    <input type="number" className={inputCls} value={mortgagePayoff} onChange={(e) => setMortgagePayoff(e.target.value)} />
                  </Field>
                  <Field label="Closing costs / taxes">
                    <input type="number" className={inputCls} value={closingCosts} onChange={(e) => setClosingCosts(e.target.value)} />
                  </Field>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                  <span className="text-ink-500">Estimated walk-away</span>
                  <span className={`font-bold ${walkAway < 0 ? "text-red-600" : "text-ink-900"}`}>{formatCurrency(walkAway)}</span>
                </div>
              </div>

              <dl className="mt-6 divide-y divide-ink-100 text-sm">
                <Row label="Address" value={`${form.addressLine1}, ${form.city}, ${form.state} ${form.zip}`} />
                <Row label="Type / Condition" value={`${form.propertyType.replace("_", " ")} · ${conditionTiers.find((t) => t.value === form.condition)?.title ?? form.condition}`} />
                <Row label="Beds / Baths / Sqft" value={`${form.bedrooms} bd · ${form.bathrooms} ba · ${form.squareFeet} sqft`} />
                <Row
                  label="Features"
                  value={
                    [
                      form.hasPool && "Pool",
                      form.hasHoa && "HOA",
                      form.garageSpaces && `${form.garageSpaces}-car garage`,
                      form.features.length > 0 && `${form.features.length} amenities`,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "None listed"
                  }
                />
                <Row label="Estimated Offer Range" value={offerRange ? `${formatCurrency(offerRange.low)} – ${formatCurrency(offerRange.high)}` : "—"} />
                <Row label="Photos" value={`${photos.length} uploaded`} />
              </dl>
              <p className="mt-6 text-xs text-ink-400">
                By submitting, you agree our team can calculate a guaranteed cash offer and share your deal
                (anonymized until under contract) with vetted investors on our platform.
              </p>
            </section>
          )}

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-ink-600 disabled:opacity-0"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl bg-cash-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-cash-700 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit for My Cash Offer"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-right font-medium text-ink-900">{value}</dd>
    </div>
  );
}
