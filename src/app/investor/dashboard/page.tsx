"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CountdownTimer } from "@/components/CountdownTimer";
import { StatusPill } from "@/components/StatusPill";
import { propertyTypeOptions } from "@/lib/validation";

type Listing = {
  id: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  status: string;
  offerPrice: number | null;
  startingBid: number | null;
  topBid: number | null;
  bidCount: number;
  auctionEndsAt: string | null;
  matchScore: number | null;
  photos: { url: string }[];
};

type SortKey = "match" | "price_asc" | "price_desc" | "ending_soon" | "newest";

const STATUS_FILTERS = [
  { value: "ALL", label: "All statuses" },
  { value: "AUCTION_LIVE", label: "Live auctions" },
  { value: "AUCTION_ENDED", label: "Ended" },
  { value: "AWARDED", label: "Awarded" },
  { value: "CLOSED", label: "Closed" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "match", label: "Best Match" },
  { value: "ending_soon", label: "Ending Soonest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

function formatMoney(n: number | null) {
  if (n === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function currentPrice(l: Listing) {
  return l.topBid ?? l.startingBid ?? 0;
}

export default function InvestorDashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [hasBuyBox, setHasBuyBox] = useState(true);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [propertyType, setPropertyType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [minBeds, setMinBeds] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("match");

  async function load() {
    const res = await fetch("/api/marketplace");
    if (res.ok) {
      const data = await res.json();
      setListings(data.listings);
      setHasBuyBox(data.hasBuyBox);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = listings.filter((l) => {
      if (q) {
        const haystack = `${l.addressLine1} ${l.city} ${l.state} ${l.zip}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (propertyType !== "ALL" && l.propertyType !== propertyType) return false;
      if (status !== "ALL" && l.status !== status) return false;
      if (minBeds && l.bedrooms < Number(minBeds)) return false;
      const price = currentPrice(l);
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case "price_asc":
          return currentPrice(a) - currentPrice(b);
        case "price_desc":
          return currentPrice(b) - currentPrice(a);
        case "ending_soon": {
          const aEnd = a.auctionEndsAt ? new Date(a.auctionEndsAt).getTime() : Infinity;
          const bEnd = b.auctionEndsAt ? new Date(b.auctionEndsAt).getTime() : Infinity;
          return aEnd - bEnd;
        }
        case "newest":
          return 0;
        case "match":
        default:
          return (b.matchScore ?? -1) - (a.matchScore ?? -1);
      }
    });

    return result;
  }, [listings, query, propertyType, status, minBeds, minPrice, maxPrice, sortKey]);

  const activeFilterCount = [
    propertyType !== "ALL",
    status !== "ALL",
    Boolean(minBeds),
    Boolean(minPrice),
    Boolean(maxPrice),
  ].filter(Boolean).length;

  function clearFilters() {
    setPropertyType("ALL");
    setStatus("ALL");
    setMinBeds("");
    setMinPrice("");
    setMaxPrice("");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Marketplace</h1>
          <p className="text-sm text-ink-500">Search live and recently closed deals, or let Smart Buy Box rank them for you.</p>
        </div>
        <Link href="/investor/buy-box" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Edit Smart Buy Box
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by address, city, or ZIP…"
              className="w-full rounded-lg border border-ink-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-lg border border-ink-200 px-3 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>Sort: {o.label}</option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 outline-none focus:border-brand-500"
          >
            <option value="ALL">All property types</option>
            {propertyTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 outline-none focus:border-brand-500"
          >
            {STATUS_FILTERS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <input
            value={minBeds}
            onChange={(e) => setMinBeds(e.target.value)}
            type="number"
            min={0}
            placeholder="Min beds"
            className="w-24 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 outline-none focus:border-brand-500"
          />
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            type="number"
            placeholder="Min price"
            className="w-28 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 outline-none focus:border-brand-500"
          />
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            type="number"
            placeholder="Max price"
            className="w-28 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 outline-none focus:border-brand-500"
          />
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-xs font-semibold text-brand-600 hover:underline">
              Clear {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}
            </button>
          )}
        </div>
      </div>

      {!hasBuyBox && !loading && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          You don&apos;t have an active Smart Buy Box yet, so deals aren&apos;t scored for fit.{" "}
          <Link href="/investor/buy-box" className="font-semibold underline">Set one up</Link> to get matched.
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-ink-400">Loading marketplace…</p>
      ) : listings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center text-ink-500">
          No live deals right now. Check back soon — new matched deals hit the marketplace daily.
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center text-ink-500">
          No deals match your search and filters.{" "}
          <button onClick={() => { setQuery(""); clearFilters(); }} className="font-semibold text-brand-600 hover:underline">
            Reset search
          </button>
        </div>
      ) : (
        <>
          <p className="mt-4 text-xs text-ink-400">{filtered.length} of {listings.length} deals shown</p>
          <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((l) => (
              <Link
                key={l.id}
                href={`/investor/auctions/${l.id}`}
                className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative h-36 bg-ink-100">
                  {l.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.photos[0].url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-ink-300">No photo</div>
                  )}
                  {l.matchScore !== null && (
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold shadow ${
                        l.matchScore >= 70
                          ? "bg-cash-500 text-white"
                          : l.matchScore >= 40
                          ? "bg-amber-400 text-ink-900"
                          : "bg-ink-200 text-ink-700"
                      }`}
                    >
                      {l.matchScore}% match
                    </span>
                  )}
                  <span className="absolute right-3 top-3">
                    <StatusPill status={l.status} />
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-ink-900">{l.addressLine1}</p>
                  <p className="text-sm text-ink-500">{l.city}, {l.state} {l.zip}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-ink-500">
                    <span className="flex items-center gap-1">
                      <BedIcon /> {l.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <BathIcon /> {l.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <SqftIcon /> {l.squareFeet.toLocaleString()} sqft
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm">
                    <div>
                      <p className="text-xs text-ink-500">Current bid</p>
                      <p className="font-bold text-ink-900">{formatMoney(l.topBid ?? l.startingBid)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-ink-500">{l.bidCount} bids</p>
                      {l.status === "AUCTION_LIVE" && l.auctionEndsAt && (
                        <p className="text-xs font-semibold text-brand-600">
                          <CountdownTimer endsAt={l.auctionEndsAt} />
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a2 2 0 012-2h14a2 2 0 012 2v6M3 18v2M21 18v2M3 12V9a2 2 0 012-2h3a2 2 0 012 2v3" />
    </svg>
  );
}
function BathIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16a1 1 0 011 1v1a5 5 0 01-5 5H8a5 5 0 01-5-5v-1a1 1 0 011-1zM7 12V6a2 2 0 012-2 2 2 0 012 2" />
    </svg>
  );
}
function SqftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4zM14 14h6v6h-6v-6zM4 20v-3h3M20 4v3h-3" />
    </svg>
  );
}
