"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatusPill } from "@/components/StatusPill";
import { formatCurrency } from "@/lib/offer";

type PipelineRow = {
  id: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  status: string;
  offerPrice: number | null;
  seller: { fullName: string };
  _count: { bids: number };
};

const STATUS_OPTIONS = [
  "ALL",
  "SUBMITTED",
  "UNDER_REVIEW",
  "OFFER_READY",
  "AUCTION_LIVE",
  "AUCTION_ENDED",
  "AWARDED",
  "CONTRACT_SIGNED",
  "CLOSED",
  "REJECTED",
];

export function AdminPipelineTable({ properties }: { properties: PipelineRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter((p) => {
      if (status !== "ALL" && p.status !== status) return false;
      if (!q) return true;
      const haystack = `${p.addressLine1} ${p.city} ${p.state} ${p.zip} ${p.seller.fullName}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [properties, query, status]);

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by address, city, ZIP, or seller…"
            className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-500"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All statuses" : s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 text-xs text-ink-400">{filtered.length} of {properties.length} properties</p>

      <div className="mt-2 overflow-hidden rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Seller</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Offer</th>
              <th className="px-4 py-3">Bids</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-ink-50/50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">{p.addressLine1}</p>
                  <p className="text-xs text-ink-500">{p.city}, {p.state} {p.zip}</p>
                </td>
                <td className="px-4 py-3 text-ink-600">{p.seller.fullName}</td>
                <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                <td className="px-4 py-3 font-semibold text-ink-900">{formatCurrency(p.offerPrice)}</td>
                <td className="px-4 py-3 text-ink-600">{p._count.bids}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/properties/${p.id}`} className="font-semibold text-brand-600 hover:underline">
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-400">
                  {properties.length === 0 ? "No submissions yet." : "No properties match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
