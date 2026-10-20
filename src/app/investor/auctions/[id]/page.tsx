"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { CountdownTimer } from "@/components/CountdownTimer";
import { StatusPill } from "@/components/StatusPill";

function money(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

type Bid = { id: string; amount: number; status: string; investorId: string; createdAt: string; investor: { id: string; fullName: string } };
type PropertyDetail = {
  id: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  propertyType: string;
  condition: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  status: string;
  startingBid: number | null;
  minBidIncrement: number;
  auctionEndsAt: string | null;
  winningBidAmount: number | null;
  awardedInvestorId: string | null;
  photos: { url: string }[];
  bids: Bid[];
};

export default function AuctionRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [hasVerifiedFunds, setHasVerifiedFunds] = useState<boolean | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/properties/${id}`);
    if (res.ok) {
      const data = await res.json();
      setProperty(data.property);
    }
    const pofRes = await fetch("/api/proof-of-funds");
    if (pofRes.ok) {
      const data = await pofRes.json();
      setHasVerifiedFunds(data.docs.some((d: { status: string }) => d.status === "VERIFIED"));
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const topBid = property?.bids[0];
  const minNext = topBid ? topBid.amount + (property?.minBidIncrement ?? 500) : property?.startingBid ?? 0;

  async function placeBid() {
    setError(null);
    const amount = Number(bidAmount);
    if (!amount || amount < minNext) {
      setError(`Your bid must be at least ${money(minNext)}.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: id, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bid failed");
      setBidAmount("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bid failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!property) {
    return <p className="text-sm text-ink-400">Loading auction…</p>;
  }

  const isLive = property.status === "AUCTION_LIVE";
  const isAwarded = property.status === "AWARDED" || property.status === "CONTRACT_SIGNED" || property.status === "CLOSED";

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/investor/dashboard" className="text-sm text-ink-500 hover:text-ink-900">← Marketplace</Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">{property.addressLine1}</h1>
          <p className="text-ink-500">{property.city}, {property.state} {property.zip}</p>
        </div>
        <StatusPill status={property.status} />
      </div>

      {property.photos.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {property.photos.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={p.url} alt="" className="h-28 w-full rounded-xl object-cover" />
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="font-bold text-ink-900">Property Details</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div><dt className="text-xs text-ink-500">Type</dt><dd className="font-semibold capitalize text-ink-900">{property.propertyType.replace(/_/g, " ").toLowerCase()}</dd></div>
              <div><dt className="text-xs text-ink-500">Condition</dt><dd className="font-semibold capitalize text-ink-900">{property.condition.replace(/_/g, " ").toLowerCase()}</dd></div>
              <div><dt className="text-xs text-ink-500">Beds / Baths</dt><dd className="font-semibold text-ink-900">{property.bedrooms} / {property.bathrooms}</dd></div>
              <div><dt className="text-xs text-ink-500">Square Feet</dt><dd className="font-semibold text-ink-900">{property.squareFeet.toLocaleString()}</dd></div>
            </dl>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="font-bold text-ink-900">Bid History</h2>
            {property.bids.length === 0 ? (
              <p className="mt-2 text-sm text-ink-400">No bids yet — be the first.</p>
            ) : (
              <ul className="mt-3 divide-y divide-ink-50">
                {property.bids.map((b, i) => (
                  <li key={b.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-ink-600">
                      Investor #{b.investorId.slice(-4).toUpperCase()}
                      {i === 0 && isLive && <span className="ml-2 rounded-full bg-cash-100 px-2 py-0.5 text-xs font-semibold text-cash-700">Leading</span>}
                      {b.status === "WON" && <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">Won</span>}
                    </span>
                    <span className="font-semibold text-ink-900">{money(b.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
            <p className="text-sm font-semibold text-brand-700">Current High Bid</p>
            <p className="mt-1 text-3xl font-extrabold text-ink-900">{money(topBid?.amount ?? property.startingBid)}</p>
            {isLive && property.auctionEndsAt && (
              <p className="mt-2 text-sm text-ink-600">
                Ends in <CountdownTimer endsAt={property.auctionEndsAt} onComplete={load} />
              </p>
            )}
            {isAwarded && (
              <p className="mt-2 text-sm text-ink-600">Awarded at {money(property.winningBidAmount)}</p>
            )}
          </div>

          {isLive && (
            <div className="rounded-2xl border border-ink-100 bg-white p-6">
              {hasVerifiedFunds === false ? (
                <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                  You need a <Link href="/investor/proof-of-funds" className="font-semibold underline">verified Proof of Funds</Link> on file before you can bid.
                </div>
              ) : (
                <>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink-700">
                      Your Bid (min {money(minNext)})
                    </span>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={String(minNext)}
                      className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </label>
                  {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
                  <button
                    onClick={placeBid}
                    disabled={submitting}
                    className="mt-4 w-full rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                  >
                    {submitting ? "Placing bid…" : "Place Bid"}
                  </button>
                  <p className="mt-3 text-xs text-ink-400">
                    A 6% platform fee applies to your winning bid only, charged at closing.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
