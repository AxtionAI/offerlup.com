"use client";

import { useRef, useState } from "react";
import { parseCsv } from "@/lib/csvParse";

type FieldKey =
  | "email"
  | "fullName"
  | "phone"
  | "companyName"
  | "password"
  | "buyBoxName"
  | "markets"
  | "propertyTypes"
  | "conditions"
  | "minPrice"
  | "maxPrice"
  | "minBedrooms"
  | "minBathrooms"
  | "minSquareFeet"
  | "maxSquareFeet"
  | "minYearBuilt"
  | "minGarageSpaces"
  | "requiresPool";

type FieldConfig = {
  key: FieldKey;
  label: string;
  required?: boolean;
  hint?: string;
  group: "Contact Info" | "Buy Box Criteria (optional)";
  synonyms: string[];
};

const FIELDS: FieldConfig[] = [
  { key: "email", label: "Email", required: true, group: "Contact Info", synonyms: ["email", "e-mail", "email address"] },
  { key: "fullName", label: "Full Name", required: true, group: "Contact Info", synonyms: ["name", "full name", "fullname", "investor name", "contact name"] },
  { key: "phone", label: "Phone", group: "Contact Info", synonyms: ["phone", "mobile", "cell", "phone number"] },
  { key: "companyName", label: "Company", group: "Contact Info", synonyms: ["company", "company name", "business"] },
  {
    key: "password",
    label: "Temp Password",
    hint: "Leave unmapped to auto-generate a secure password per investor",
    group: "Contact Info",
    synonyms: ["password", "temp password", "initial password"],
  },
  { key: "buyBoxName", label: "Buy Box Name", hint: "Defaults to “Imported Buy Box”", group: "Buy Box Criteria (optional)", synonyms: ["buy box name", "buybox name", "buy box"] },
  {
    key: "markets",
    label: "Target Markets",
    hint: "Separate multiple with ; e.g. Phoenix, AZ; Tucson, AZ",
    group: "Buy Box Criteria (optional)",
    synonyms: ["markets", "target markets", "cities", "market", "areas"],
  },
  {
    key: "propertyTypes",
    label: "Property Types",
    hint: "Comma-separated, e.g. Single Family, Condo",
    group: "Buy Box Criteria (optional)",
    synonyms: ["property types", "property type", "types"],
  },
  {
    key: "conditions",
    label: "Conditions",
    hint: "Comma-separated, e.g. Fixer, Move-in Ready",
    group: "Buy Box Criteria (optional)",
    synonyms: ["conditions", "condition"],
  },
  { key: "minPrice", label: "Min Price", group: "Buy Box Criteria (optional)", synonyms: ["min price", "minimum price", "price min"] },
  { key: "maxPrice", label: "Max Price", group: "Buy Box Criteria (optional)", synonyms: ["max price", "maximum price", "price max"] },
  { key: "minBedrooms", label: "Min Bedrooms", group: "Buy Box Criteria (optional)", synonyms: ["min bedrooms", "min beds", "bedrooms"] },
  { key: "minBathrooms", label: "Min Bathrooms", group: "Buy Box Criteria (optional)", synonyms: ["min bathrooms", "min baths", "bathrooms"] },
  { key: "minSquareFeet", label: "Min Square Feet", group: "Buy Box Criteria (optional)", synonyms: ["min square feet", "min sqft", "min sq ft"] },
  { key: "maxSquareFeet", label: "Max Square Feet", group: "Buy Box Criteria (optional)", synonyms: ["max square feet", "max sqft", "max sq ft"] },
  { key: "minYearBuilt", label: "Min Year Built", group: "Buy Box Criteria (optional)", synonyms: ["min year built", "year built"] },
  { key: "minGarageSpaces", label: "Min Garage Spaces", group: "Buy Box Criteria (optional)", synonyms: ["min garage spaces", "garage spaces", "garage"] },
  { key: "requiresPool", label: "Requires Pool", hint: "yes/no", group: "Buy Box Criteria (optional)", synonyms: ["requires pool", "pool"] },
];

type Step = "upload" | "map" | "review" | "done";

type ImportRowResult = {
  row: number;
  email: string;
  status: "created" | "skipped" | "error";
  message: string;
  tempPassword?: string;
};

function guessMapping(headers: string[]): Partial<Record<FieldKey, string>> {
  const mapping: Partial<Record<FieldKey, string>> = {};
  const used = new Set<string>();
  for (const field of FIELDS) {
    const match = headers.find(
      (h) => !used.has(h) && field.synonyms.some((syn) => h.trim().toLowerCase() === syn)
    );
    if (match) {
      mapping[field.key] = match;
      used.add(match);
    }
  }
  return mapping;
}

export default function InvestorImportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Partial<Record<FieldKey, string>>>({});
  const [mappedRows, setMappedRows] = useState<Record<string, string>[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState<{ created: number; skipped: number; errors: number } | null>(null);
  const [results, setResults] = useState<ImportRowResult[] | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetAll() {
    setStep("upload");
    setFileName("");
    setHeaders([]);
    setDataRows([]);
    setMapping({});
    setMappedRows([]);
    setSummary(null);
    setResults(null);
    setFileError(null);
    setSubmitError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFile(file: File) {
    setFileError(null);
    const text = await file.text();
    const { headers: parsedHeaders, rows } = parseCsv(text);
    if (parsedHeaders.length === 0 || rows.length === 0) {
      setFileError("Couldn't find any data rows in that file. Make sure it's a CSV with a header row.");
      return;
    }
    setFileName(file.name);
    setHeaders(parsedHeaders);
    setDataRows(rows);
    setMapping(guessMapping(parsedHeaders));
    setStep("map");
  }

  function buildMappedRows(): Record<string, string>[] {
    const indexByHeader = new Map(headers.map((h, i) => [h, i]));
    return dataRows.map((row) => {
      const obj: Record<string, string> = {};
      for (const field of FIELDS) {
        const header = mapping[field.key];
        if (!header) continue;
        const idx = indexByHeader.get(header);
        obj[field.key] = idx !== undefined ? (row[idx] ?? "").trim() : "";
      }
      return obj;
    });
  }

  function goToReview() {
    setMappedRows(buildMappedRows());
    setStep("review");
  }

  async function submitImport() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/admin/investors/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: mappedRows }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.error ?? "Import failed");
        return;
      }
      setSummary(json.summary);
      setResults(json.results);
      setStep("done");
    } catch {
      setSubmitError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function downloadResultsCsv() {
    if (!results) return;
    const header = ["Row", "Email", "Status", "Message", "Temp Password"];
    const lines = [header, ...results.map((r) => [String(r.row), r.email, r.status, r.message, r.tempPassword ?? ""])];
    const csv = lines
      .map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "investor-import-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const canContinueFromMap = Boolean(mapping.email && mapping.fullName);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold text-ink-900">Bulk Import Investors</h1>
      <p className="text-sm text-ink-500">
        Upload a CSV of buyers, map the columns to investor fields, and create accounts (plus an optional Smart Buy
        Box) in bulk.
      </p>

      <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-ink-400">
        {(["upload", "map", "review", "done"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                step === s ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-400"
              }`}
            >
              {i + 1}
            </span>
            <span className={step === s ? "text-ink-900" : ""}>
              {s === "upload" ? "Upload" : s === "map" ? "Map Columns" : s === "review" ? "Review" : "Done"}
            </span>
            {i < 3 && <span className="mx-1 text-ink-300">→</span>}
          </div>
        ))}
      </div>

      {step === "upload" && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-ink-200 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-ink-700">Drop a CSV file here, or choose one to upload</p>
          <p className="mt-1 text-xs text-ink-400">
            First row should be column headers. We&apos;ll let you map each column to an investor field next.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="mt-5 block w-full text-sm text-ink-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {fileError && <p className="mt-3 text-sm text-red-600">{fileError}</p>}
        </div>
      )}

      {step === "map" && (
        <div className="mt-8">
          <p className="text-sm text-ink-500">
            <span className="font-semibold text-ink-900">{fileName}</span> · {dataRows.length} row
            {dataRows.length === 1 ? "" : "s"} detected
          </p>

          {(["Contact Info", "Buy Box Criteria (optional)"] as const).map((group) => (
            <div key={group} className="mt-6 rounded-2xl border border-ink-100 bg-white p-6">
              <h2 className="font-bold text-ink-900">{group}</h2>
              <div className="mt-4 space-y-3">
                {FIELDS.filter((f) => f.group === group).map((field) => {
                  const selected = mapping[field.key] ?? "";
                  const previewIdx = selected ? headers.indexOf(selected) : -1;
                  const previewValue = previewIdx >= 0 ? dataRows[0]?.[previewIdx] : undefined;
                  return (
                    <div key={field.key} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[180px_1fr_1fr]">
                      <label className="text-sm font-medium text-ink-700">
                        {field.label}
                        {field.required && <span className="text-red-500"> *</span>}
                      </label>
                      <select
                        value={selected}
                        onChange={(e) =>
                          setMapping((m) => ({ ...m, [field.key]: e.target.value || undefined }))
                        }
                        className="rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                      >
                        <option value="">— Not mapped —</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <span className="truncate text-xs text-ink-400">
                        {field.hint ?? (previewValue ? `e.g. "${previewValue}"` : "")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {!canContinueFromMap && (
            <p className="mt-4 text-sm text-red-600">Map Email and Full Name before continuing.</p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={resetAll}
              className="rounded-xl border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              Start Over
            </button>
            <button
              onClick={goToReview}
              disabled={!canContinueFromMap}
              className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to Review →
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="mt-8">
          <p className="text-sm text-ink-500">
            Ready to import <span className="font-semibold text-ink-900">{mappedRows.length}</span> investor
            {mappedRows.length === 1 ? "" : "s"}. Showing the first 10 below — final validation happens on import.
          </p>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50 text-xs font-semibold uppercase text-ink-500">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Markets</th>
                  <th className="px-4 py-3">Property Types</th>
                </tr>
              </thead>
              <tbody>
                {mappedRows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-ink-50 last:border-0">
                    <td className={`px-4 py-2 ${!row.email ? "font-semibold text-red-600" : "text-ink-900"}`}>
                      {row.email || "missing"}
                    </td>
                    <td className={`px-4 py-2 ${!row.fullName ? "font-semibold text-red-600" : "text-ink-900"}`}>
                      {row.fullName || "missing"}
                    </td>
                    <td className="px-4 py-2 text-ink-600">{row.phone || "—"}</td>
                    <td className="px-4 py-2 text-ink-600">{row.companyName || "—"}</td>
                    <td className="px-4 py-2 text-ink-600">{row.markets || "—"}</td>
                    <td className="px-4 py-2 text-ink-600">{row.propertyTypes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {submitError && <p className="mt-4 text-sm text-red-600">{submitError}</p>}

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep("map")}
              className="rounded-xl border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              ← Back to Mapping
            </button>
            <button
              onClick={submitImport}
              disabled={submitting}
              className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Importing…" : `Import ${mappedRows.length} Investor${mappedRows.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      )}

      {step === "done" && summary && results && (
        <div className="mt-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-cash-100 bg-cash-50 p-5 text-center">
              <div className="text-2xl font-extrabold text-cash-700">{summary.created}</div>
              <div className="text-xs text-ink-500">Created</div>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center">
              <div className="text-2xl font-extrabold text-amber-700">{summary.skipped}</div>
              <div className="text-xs text-ink-500">Skipped (existing email)</div>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
              <div className="text-2xl font-extrabold text-red-700">{summary.errors}</div>
              <div className="text-xs text-ink-500">Errors</div>
            </div>
          </div>

          {summary.created > 0 && (
            <p className="mt-4 text-sm text-ink-600">
              Temporary passwords were generated for new accounts (shown below). Share them with each investor
              securely — there&apos;s no automated invite email yet.
            </p>
          )}

          <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50 text-xs font-semibold uppercase text-ink-500">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Temp Password</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.row} className="border-b border-ink-50 last:border-0">
                    <td className="px-4 py-2 text-ink-400">{r.row}</td>
                    <td className="px-4 py-2 text-ink-900">{r.email || "—"}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          r.status === "created"
                            ? "bg-cash-100 text-cash-700"
                            : r.status === "skipped"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-ink-600">{r.message}</td>
                    <td className="px-4 py-2 font-mono text-xs text-ink-700">{r.tempPassword ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={downloadResultsCsv}
              className="rounded-xl border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              Download Results CSV
            </button>
            <button
              onClick={resetAll}
              className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
