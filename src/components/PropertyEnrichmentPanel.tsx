function money(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function date(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

type BatchDataProperty = {
  ids?: { apn?: string };
  owner?: {
    fullName?: string;
    ownerOccupied?: boolean;
    ownerStatusType?: string;
    mailingAddress?: { city?: string; state?: string };
  };
  assessment?: { totalAssessedValue?: number; totalMarketValue?: number; assessmentYear?: number };
  tax?: { taxYear?: number };
  building?: {
    yearBuilt?: number;
    livingAreaSquareFeet?: number;
    bedroomCount?: number;
    bathroomCount?: number;
    storyCount?: number;
    features?: string[];
  };
  permit?: {
    permitCount?: number;
    earliestDate?: string;
    latestDate?: string;
    totalJobValue?: number;
    tags?: Record<string, boolean>;
  };
  openLien?: { totalOpenLienCount?: number };
  involuntaryLien?: Record<string, unknown>;
  foreclosure?: Record<string, unknown>;
  sale?: { lastSale?: { saleAmount?: number; saleDate?: string } };
  deedHistory?: unknown[];
  valuation?: { estimatedValue?: number; priceRangeLow?: number; priceRangeHigh?: number; equityPercent?: number; ltv?: number };
  propertyOwnerProfile?: { propertiesCount?: number; averageAssessedValue?: number };
  quickLists?: Record<string, boolean>;
};

export type PropertyEnrichmentData = {
  status: "MATCHED" | "NO_MATCH" | "ERROR";
  errorMessage?: string | null;
  fetchedAt: string;
  data: BatchDataProperty | null;
};

const QUICK_LIST_LABELS: Record<string, string> = {
  absenteeOwner: "Absentee Owner",
  vacant: "Vacant",
  preforeclosure: "Pre-Foreclosure",
  highEquity: "High Equity",
  lowEquity: "Low Equity",
  freeAndClear: "Free & Clear",
  corporateOwned: "Corporate Owned",
  taxDefault: "Tax Default",
  cashBuyer: "Cash Buyer",
  inherited: "Inherited",
  tiredLandlord: "Tired Landlord",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className="font-semibold text-ink-900">{value ?? "—"}</dd>
    </div>
  );
}

function Mismatch({ submitted, record }: { submitted: number | null | undefined; record: number | null | undefined }) {
  if (submitted == null || record == null || submitted === record) return null;
  return <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">seller said {submitted}</span>;
}

export function PropertyEnrichmentPanel({
  enrichment,
  sellerFullName,
  submitted,
}: {
  enrichment: PropertyEnrichmentData | null;
  sellerFullName: string;
  submitted: { yearBuilt?: number | null; squareFeet?: number | null; bedrooms?: number | null; bathrooms?: number | null };
}) {
  if (!enrichment) {
    return (
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="font-bold text-ink-900">County &amp; Title Records</h2>
        <p className="mt-2 text-sm text-ink-400">Fetching from BatchData — check back in a moment.</p>
      </div>
    );
  }

  if (enrichment.status === "ERROR") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-bold text-ink-900">County &amp; Title Records</h2>
        <p className="mt-2 text-sm text-amber-800">Lookup failed: {enrichment.errorMessage ?? "Unknown error"}</p>
      </div>
    );
  }

  if (enrichment.status === "NO_MATCH" || !enrichment.data) {
    return (
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="font-bold text-ink-900">County &amp; Title Records</h2>
        <p className="mt-2 text-sm text-ink-400">No county record matched this address.</p>
      </div>
    );
  }

  const d = enrichment.data;
  const ownerNameMismatch =
    d.owner?.fullName &&
    sellerFullName &&
    !d.owner.fullName.toLowerCase().includes(sellerFullName.toLowerCase().split(" ").pop() ?? "~nomatch~");
  const activeQuickLists = Object.entries(d.quickLists ?? {}).filter(([, v]) => v);
  const permitTags = Object.entries(d.permit?.tags ?? {}).filter(([, v]) => v);

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-ink-900">County &amp; Title Records</h2>
        <span className="text-xs text-ink-400">via BatchData · {date(enrichment.fetchedAt)}</span>
      </div>

      {ownerNameMismatch && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          Owner of record (&quot;{d.owner?.fullName}&quot;) doesn&apos;t obviously match the submitting seller (&quot;{sellerFullName}&quot;) — worth a manual check.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Owner of Record" value={d.owner?.fullName} />
        <Field label="Owner Occupied" value={d.owner?.ownerOccupied === undefined ? "—" : d.owner.ownerOccupied ? "Yes" : "No"} />
        <Field label="APN" value={d.ids?.apn} />
        <Field label="Assessed Value" value={money(d.assessment?.totalAssessedValue)} />
        <Field label="Market Value (Assessor)" value={money(d.assessment?.totalMarketValue)} />
        <Field label="Tax Year" value={d.tax?.taxYear ?? d.assessment?.assessmentYear} />
        <Field
          label="Year Built (Record)"
          value={<>{d.building?.yearBuilt ?? "—"}<Mismatch submitted={submitted.yearBuilt} record={d.building?.yearBuilt} /></>}
        />
        <Field
          label="Living Sqft (Record)"
          value={<>{d.building?.livingAreaSquareFeet ?? "—"}<Mismatch submitted={submitted.squareFeet} record={d.building?.livingAreaSquareFeet} /></>}
        />
        <Field
          label="Beds (Record)"
          value={<>{d.building?.bedroomCount ?? "—"}<Mismatch submitted={submitted.bedrooms} record={d.building?.bedroomCount} /></>}
        />
        <Field
          label="Baths (Record)"
          value={<>{d.building?.bathroomCount ?? "—"}<Mismatch submitted={submitted.bathrooms} record={d.building?.bathroomCount} /></>}
        />
        <Field label="Last Sale" value={d.sale?.lastSale?.saleAmount ? `${money(d.sale.lastSale.saleAmount)} (${date(d.sale.lastSale.saleDate)})` : "—"} />
        <Field label="Deed History on File" value={d.deedHistory && d.deedHistory.length > 0 ? `${d.deedHistory.length} record(s)` : "None on file"} />
        <Field label="Open Liens" value={d.openLien?.totalOpenLienCount ?? 0} />
        <Field label="Foreclosure Status" value={Object.keys(d.foreclosure ?? {}).length > 0 ? "On file" : "None on file"} />
        <Field label="Equity %" value={d.valuation?.equityPercent != null ? `${d.valuation.equityPercent}%` : "—"} />
        <Field label="Estimated Value (AVM)" value={d.valuation?.estimatedValue ? money(d.valuation.estimatedValue) : "Not available on current plan"} />
      </div>

      <div className="mt-5 border-t border-ink-50 pt-4">
        <p className="text-xs font-semibold text-ink-500">Permits ({d.permit?.permitCount ?? 0} on file)</p>
        {d.permit?.permitCount ? (
          <>
            <p className="mt-1 text-sm text-ink-700">
              {date(d.permit.earliestDate)} – {date(d.permit.latestDate)} · total job value {money(d.permit.totalJobValue)}
            </p>
            {permitTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {permitTags.map(([tag]) => (
                  <span key={tag} className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                    {tag.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="mt-1 text-sm text-ink-400">No permits on file.</p>
        )}
      </div>

      {d.propertyOwnerProfile?.propertiesCount != null && d.propertyOwnerProfile.propertiesCount > 1 && (
        <div className="mt-4 border-t border-ink-50 pt-4">
          <p className="text-xs font-semibold text-ink-500">Owner Portfolio</p>
          <p className="mt-1 text-sm text-ink-700">
            Owns {d.propertyOwnerProfile.propertiesCount} properties · avg. assessed value {money(d.propertyOwnerProfile.averageAssessedValue)}
          </p>
        </div>
      )}

      {activeQuickLists.length > 0 && (
        <div className="mt-4 border-t border-ink-50 pt-4">
          <p className="text-xs font-semibold text-ink-500">Signals</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {activeQuickLists.map(([key]) => (
              <span key={key} className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                {QUICK_LIST_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
