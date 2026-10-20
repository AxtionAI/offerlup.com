"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { StatusPill } from "@/components/StatusPill";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ConfirmButton } from "@/components/ConfirmButton";

function money(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

type Bid = { id: string; amount: number; investorId: string; investor: { fullName: string; email: string } };
type Property = {
  id: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  status: string;
  propertyType: string;
  condition: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  zillowEstimate: number;
  afterRepairValue: number | null;
  rehabCost: number | null;
  offerPrice: number | null;
  startingBid: number | null;
  auctionEndsAt: string | null;
  winningBidAmount: number | null;
  platformFeeAmount: number | null;
  seller: { fullName: string; email: string; phone: string | null };
  awardedInvestor: { fullName: string; email: string } | null;
  photos: { url: string }[];
  bids: Bid[];
};

export default function AdminPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [property, setProperty] = useState<Property | null>(null);
  const [arv, setArv] = useState("");
  const [rehab, setRehab] = useState("");
  const [zillow, setZillow] = useState("");
  const [durationHours, setDurationHours] = useState("48");
  const [startingBidOverride, setStartingBidOverride] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/properties/${id}`);
    if (res.ok) {
      const data = await res.json();
      setProperty(data.property);
      setZillow(String(data.property.zillowEstimate ?? ""));
      if (data.property.afterRepairValue) setArv(String(data.property.afterRepairValue));
      if (data.property.rehabCost) setRehab(String(data.property.rehabCost));
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const previewFlip = arv && rehab ? Number(arv) - Number(rehab) : null;
  const previewZillowDiscount = zillow ? Number(zillow) * 0.8 : null;
  const previewOffer =
    previewFlip !== null && previewZillowDiscount !== null ? Math.max(0, Math.min(previewFlip, previewZillowDiscount)) : null;

  async function submitReview() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/properties/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ afterRepairValue: arv, rehabCost: rehab, zillowEstimate: zillow }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    setBusy(true);
    await fetch(`/api/admin/properties/${id}/reject`, { method: "POST" });
    load();
    setBusy(false);
  }

  async function startAuction() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/properties/${id}/auction/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationHours,
          startingBid: startingBidOverride || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function endAuction() {
    setBusy(true);
    await fetch(`/api/admin/properties/${id}/auction/end`, { method: "POST" });
    load();
    setBusy(false);
  }

  if (!property) return <p className="text-sm text-ink-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/dashboard" className="text-sm text-ink-500 hover:text-ink-900">← Pipeline</Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">{property.addressLine1}</h1>
          <p className="text-ink-500">{property.city}, {property.state} {property.zip}</p>
        </div>
        <StatusPill status={property.status} />
      </div>

      {property.photos.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {property.photos.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={p.url} alt="" className="h-24 w-full rounded-lg object-cover" />
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="font-bold text-ink-900">Seller</h2>
            <p className="mt-2 text-sm text-ink-700">{property.seller.fullName}</p>
            <p className="text-sm text-ink-500">{property.seller.email} · {property.seller.phone}</p>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="font-bold text-ink-900">Specs</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div><dt className="text-xs text-ink-500">Type</dt><dd className="font-semibold text-ink-900">{property.propertyType.replace(/_/g, " ")}</dd></div>
              <div><dt className="text-xs text-ink-500">Condition</dt><dd className="font-semibold text-ink-900">{property.condition.replace(/_/g, " ")}</dd></div>
              <div><dt className="text-xs text-ink-500">Bd/Ba/Sqft</dt><dd className="font-semibold text-ink-900">{property.bedrooms}/{property.bathrooms}/{property.squareFeet}</dd></div>
            </dl>
          </div>

          {(property.status === "SUBMITTED" || property.status === "UNDER_REVIEW") && (
            <div className="rounded-2xl border border-ink-100 bg-white p-6">
              <h2 className="font-bold text-ink-900">Calculate Guaranteed Offer</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink-700">After Repair Value</span>
                  <input value={arv} onChange={(e) => setArv(e.target.value)} type="number" className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink-700">Rehab Cost</span>
                  <input value={rehab} onChange={(e) => setRehab(e.target.value)} type="number" className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink-700">Zillow Estimate</span>
                  <input value={zillow} onChange={(e) => setZillow(e.target.value)} type="number" className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
                </label>
              </div>

              {previewOffer !== null && (
                <div className="mt-4 rounded-xl bg-cash-50 p-4 text-sm">
                  <div className="flex justify-between text-ink-600"><span>Flip math (ARV − rehab)</span><span>{money(previewFlip)}</span></div>
                  <div className="flex justify-between text-ink-600"><span>80% of Zillow Estimate</span><span>{money(previewZillowDiscount)}</span></div>
                  <div className="mt-2 flex justify-between border-t border-cash-200 pt-2 text-base font-bold text-cash-700">
                    <span>Guaranteed Offer</span><span>{money(previewOffer)}</span>
                  </div>
                </div>
              )}

              {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

              <div className="mt-5 flex gap-3">
                <button onClick={submitReview} disabled={busy || !arv || !rehab} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                  Approve &amp; Set Offer
                </button>
                <ConfirmButton
                  onConfirm={reject}
                  disabled={busy}
                  confirmLabel="Confirm Reject"
                  className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Reject
                </ConfirmButton>
              </div>
            </div>
          )}

          {property.status === "OFFER_READY" && (
            <div className="rounded-2xl border border-ink-100 bg-white p-6">
              <h2 className="font-bold text-ink-900">Start Investor Auction</h2>
              <p className="mt-1 text-sm text-ink-500">Guaranteed offer: <strong>{money(property.offerPrice)}</strong> (fixed for the seller)</p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink-700">Duration (hours)</span>
                  <input value={durationHours} onChange={(e) => setDurationHours(e.target.value)} type="number" className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink-700">Starting Bid (optional)</span>
                  <input
                    value={startingBidOverride}
                    onChange={(e) => setStartingBidOverride(e.target.value)}
                    type="number"
                    placeholder={String(Math.round((property.offerPrice ?? 0) * 1.05))}
                    className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
              <button onClick={startAuction} disabled={busy} className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                Launch Auction
              </button>
            </div>
          )}

          {(property.status === "AUCTION_LIVE" || property.status === "AUCTION_ENDED" || property.status === "AWARDED") && (
            <div className="rounded-2xl border border-ink-100 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-ink-900">Bids</h2>
                {property.status === "AUCTION_LIVE" && property.auctionEndsAt && (
                  <span className="text-sm text-ink-500"><CountdownTimer endsAt={property.auctionEndsAt} /></span>
                )}
              </div>
              {property.bids.length === 0 ? (
                <p className="mt-2 text-sm text-ink-400">No bids yet.</p>
              ) : (
                <ul className="mt-3 divide-y divide-ink-50 text-sm">
                  {property.bids.map((b, i) => (
                    <li key={b.id} className="flex justify-between py-2">
                      <span className="text-ink-700">{b.investor.fullName} ({b.investor.email}) {i === 0 && <span className="ml-1 font-semibold text-cash-600">Leading</span>}</span>
                      <span className="font-semibold text-ink-900">{money(b.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {property.status === "AUCTION_LIVE" && (
                <div className="mt-4">
                  <ConfirmButton
                    onConfirm={endAuction}
                    disabled={busy}
                    confirmLabel="Confirm End Auction"
                    className="rounded-xl border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
                  >
                    End Auction Now
                  </ConfirmButton>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-cash-100 bg-cash-50 p-6">
            <p className="text-sm font-semibold text-cash-700">Guaranteed Offer</p>
            <p className="mt-1 text-2xl font-extrabold text-ink-900">{money(property.offerPrice)}</p>
          </div>
          {property.winningBidAmount && (
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-6">
              <p className="text-sm font-semibold text-violet-700">Winning Bid</p>
              <p className="mt-1 text-2xl font-extrabold text-ink-900">{money(property.winningBidAmount)}</p>
              <p className="mt-2 text-xs text-ink-500">Platform fee (6%): {money(property.platformFeeAmount)}</p>
              {property.awardedInvestor && (
                <p className="mt-1 text-xs text-ink-500">Awarded to {property.awardedInvestor.fullName}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
