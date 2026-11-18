"use client";

import { Fragment, useMemo, useState } from "react";
import { StatusPill } from "@/components/StatusPill";
import { formatCurrency } from "@/lib/offer";

type Purchase = {
  id: string;
  address: string;
  city: string;
  state: string;
  status: string;
  amount: number | null;
  updatedAt: string;
};

type InvestorRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  createdAt: string;
  bidCount: number;
  buyBoxCount: number;
  proofOfFundsStatus: string | null;
  proofOfFundsAmount: number | null;
  targetMarkets: string[];
  purchases: Purchase[];
};

export function AdminInvestorsTable({ investors }: { investors: InvestorRow[] }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return investors;
    return investors.filter((inv) => {
      const haystack = `${inv.fullName} ${inv.email} ${inv.companyName ?? ""} ${inv.targetMarkets.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [investors, query]);

  return (
    <div className="mt-8">
      <div className="relative">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, company, email, or market…"
          className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:max-w-sm"
        />
      </div>

      <p className="mt-3 text-xs text-ink-400">{filtered.length} of {investors.length} buyers</p>

      <div className="mt-2 overflow-hidden rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Target Markets</th>
              <th className="px-4 py-3">Proof of Funds</th>
              <th className="px-4 py-3">Deals Won</th>
              <th className="px-4 py-3">Total Spent</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {filtered.map((inv) => {
              const totalSpent = inv.purchases.reduce((s, p) => s + (p.amount ?? 0), 0);
              const isOpen = expanded === inv.id;
              return (
                <Fragment key={inv.id}>
                  <tr className="hover:bg-ink-50/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink-900">{inv.fullName}</p>
                      <p className="text-xs text-ink-500">{inv.companyName ?? inv.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {inv.targetMarkets.length > 0 ? (
                        <span className="text-xs">{inv.targetMarkets.join(", ")}</span>
                      ) : (
                        <span className="text-xs text-ink-300">No buy box set</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {inv.proofOfFundsStatus ? (
                        <StatusPill status={inv.proofOfFundsStatus} />
                      ) : (
                        <span className="text-xs text-ink-300">None submitted</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{inv.purchases.length}</td>
                    <td className="px-4 py-3 font-semibold text-ink-900">{formatCurrency(totalSpent)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setExpanded(isOpen ? null : inv.id)}
                        className="font-semibold text-brand-600 hover:underline"
                      >
                        {isOpen ? "Hide" : "Details →"}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-ink-50/40">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Contact</p>
                            <p className="mt-1 text-ink-700">{inv.email}</p>
                            <p className="text-ink-700">{inv.phone ?? "No phone on file"}</p>
                            <p className="mt-2 text-xs text-ink-400">
                              Joined {new Date(inv.createdAt).toLocaleDateString()} · {inv.bidCount} total bids ·{" "}
                              {inv.buyBoxCount} buy box{inv.buyBoxCount === 1 ? "" : "es"}
                            </p>
                            {inv.proofOfFundsAmount != null && (
                              <p className="mt-2 text-xs text-ink-500">
                                Verified funds: {formatCurrency(inv.proofOfFundsAmount)}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                              Purchase history
                            </p>
                            {inv.purchases.length === 0 ? (
                              <p className="mt-1 text-ink-400">No deals won yet.</p>
                            ) : (
                              <ul className="mt-1 space-y-2">
                                {inv.purchases.map((p) => (
                                  <li key={p.id} className="flex items-center justify-between gap-3 text-ink-700">
                                    <span>
                                      {p.address}, {p.city}, {p.state}
                                    </span>
                                    <span className="flex items-center gap-2 whitespace-nowrap">
                                      <StatusPill status={p.status} />
                                      <span className="font-semibold text-ink-900">{formatCurrency(p.amount)}</span>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-400">
                  {investors.length === 0 ? "No investors registered yet." : "No buyers match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
