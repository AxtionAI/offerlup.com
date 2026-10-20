const STATUS_META: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "Submitted", className: "bg-ink-100 text-ink-700" },
  UNDER_REVIEW: { label: "Under Review", className: "bg-amber-100 text-amber-800" },
  OFFER_READY: { label: "Offer Ready", className: "bg-cash-100 text-cash-700" },
  AUCTION_LIVE: { label: "Auction Live", className: "bg-brand-100 text-brand-700" },
  AUCTION_ENDED: { label: "Auction Ended", className: "bg-ink-200 text-ink-700" },
  AWARDED: { label: "Awarded", className: "bg-violet-100 text-violet-700" },
  CONTRACT_SIGNED: { label: "Contract Signed", className: "bg-violet-100 text-violet-700" },
  CLOSED: { label: "Closed", className: "bg-cash-100 text-cash-700" },
  REJECTED: { label: "Not a Fit", className: "bg-red-100 text-red-700" },
  PENDING: { label: "Pending Review", className: "bg-amber-100 text-amber-800" },
  VERIFIED: { label: "Verified", className: "bg-cash-100 text-cash-700" },
  UNVERIFIED: { label: "Unverified", className: "bg-ink-100 text-ink-600" },
};

export function StatusPill({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, className: "bg-ink-100 text-ink-700" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}
