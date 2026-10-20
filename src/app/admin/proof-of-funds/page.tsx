"use client";

import { useEffect, useState } from "react";
import { StatusPill } from "@/components/StatusPill";

type Doc = {
  id: string;
  documentName: string;
  documentUrl: string;
  fundsAmount: number;
  sourceType: string;
  status: string;
  investor: { fullName: string; email: string; companyName: string | null };
};

export default function AdminProofOfFundsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  async function load() {
    const res = await fetch("/api/admin/proof-of-funds");
    if (res.ok) setDocs((await res.json()).docs);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: "VERIFIED" | "REJECTED", reviewerNote?: string) {
    setBusyId(id);
    await fetch(`/api/admin/proof-of-funds/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewerNote }),
    });
    await load();
    setBusyId(null);
    setRejectingId(null);
    setRejectNote("");
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-extrabold text-ink-900">Proof of Funds Queue</h1>
      <p className="text-sm text-ink-500">Verify investor funds before they&apos;re allowed to bid on live auctions.</p>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-ink-400">Loading…</p>
        ) : docs.length === 0 ? (
          <p className="text-sm text-ink-400">No documents submitted yet.</p>
        ) : (
          docs.map((d) => (
            <div key={d.id} className="rounded-2xl border border-ink-100 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink-900">
                    {d.investor.fullName} {d.investor.companyName && <span className="text-ink-400">· {d.investor.companyName}</span>}
                  </p>
                  <p className="text-sm text-ink-500">{d.investor.email}</p>
                  <p className="mt-1 text-sm text-ink-700">${d.fundsAmount.toLocaleString()} · {d.sourceType}</p>
                  <a href={d.documentUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm font-semibold text-brand-600 hover:underline">
                    View document ↗
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={d.status} />
                  {d.status === "PENDING" && rejectingId !== d.id && (
                    <>
                      <button
                        onClick={() => setStatus(d.id, "VERIFIED")}
                        disabled={busyId === d.id}
                        className="rounded-lg bg-cash-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cash-700 disabled:opacity-60"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => setRejectingId(d.id)}
                        disabled={busyId === d.id}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {rejectingId === d.id && (
                <div className="mt-4 rounded-xl bg-red-50 p-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-red-800">Reason shown to investor</span>
                    <input
                      autoFocus
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="e.g. Statement is older than 30 days"
                      className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setStatus(d.id, "REJECTED", rejectNote || undefined)}
                      disabled={busyId === d.id}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setRejectNote("");
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-500 hover:text-ink-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
