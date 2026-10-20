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
  reviewerNote: string | null;
  createdAt: string;
};

export default function ProofOfFundsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundsAmount, setFundsAmount] = useState("");
  const [sourceType, setSourceType] = useState("Cash in bank");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/proof-of-funds");
    if (res.ok) setDocs((await res.json()).docs);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Attach a bank statement or proof document.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("subdir", "pof");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      const res = await fetch("/api/proof-of-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundsAmount,
          sourceType,
          documentUrl: uploadData.url,
          documentName: file.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setFundsAmount("");
      setFile(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold text-ink-900">Proof of Funds</h1>
      <p className="text-sm text-ink-500">
        Upload verifiable funds once and get cleared to bid on every matching deal — no need to re-submit per
        auction.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-ink-100 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Verifiable Funds Amount ($)</span>
            <input
              type="number"
              required
              value={fundsAmount}
              onChange={(e) => setFundsAmount(e.target.value)}
              className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Source</span>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option>Cash in bank</option>
              <option>Hard money lender pre-approval</option>
              <option>Line of credit</option>
              <option>Private equity partner</option>
            </select>
          </label>
        </div>

        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 p-8 text-center hover:border-brand-400">
          <span className="text-sm font-medium text-ink-600">{file ? file.name : "Upload bank statement or POF letter (PDF, JPG, PNG)"}</span>
          <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>

        {error && <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit for Verification"}
        </button>
      </form>

      <div className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold text-ink-700">Submitted Documents</h2>
        {loading ? (
          <p className="text-sm text-ink-400">Loading…</p>
        ) : docs.length === 0 ? (
          <p className="text-sm text-ink-400">No proof of funds submitted yet.</p>
        ) : (
          docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-ink-100 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  ${d.fundsAmount.toLocaleString()} · {d.sourceType}
                </p>
                <p className="text-xs text-ink-500">{d.documentName}</p>
                {d.reviewerNote && <p className="mt-1 text-xs text-red-600">{d.reviewerNote}</p>}
              </div>
              <StatusPill status={d.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
