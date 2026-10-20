import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settleAuctionIfNeeded } from "@/lib/auction";
import { StatusPill } from "@/components/StatusPill";
import { formatCurrency } from "@/lib/offer";
import { CountdownTimer } from "@/components/CountdownTimer";

const STEPS = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "OFFER_READY",
  "AUCTION_LIVE",
  "AWARDED",
  "CLOSED",
];

export default async function SellerPropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  await settleAuctionIfNeeded(id);

  const property = await prisma.property.findUnique({
    where: { id },
    include: { photos: { orderBy: { sortOrder: "asc" } }, bids: true },
  });
  if (!property || property.sellerId !== session.userId) notFound();

  const stepIndex = Math.max(0, STEPS.indexOf(property.status));
  const isRejected = property.status === "REJECTED";

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/seller/properties" className="text-sm text-ink-500 hover:text-ink-900">← All properties</Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">{property.addressLine1}</h1>
          <p className="text-ink-500">{property.city}, {property.state} {property.zip}</p>
        </div>
        <StatusPill status={property.status} />
      </div>

      {!isRejected && (
        <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-400">
            {STEPS.map((s, i) => (
              <span key={s} className={i <= stepIndex ? "text-brand-600" : ""}>
                {s.replace(/_/g, " ")}
              </span>
            ))}
          </div>
          <div className="mt-3 h-2 rounded-full bg-ink-100">
            <div
              className="h-2 rounded-full bg-brand-600 transition-all"
              style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {isRejected && (
        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
          {property.rejectionReason ?? "We're not able to make an offer on this property right now."}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {property.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {property.photos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={photo.id} src={photo.url} alt="" className="h-28 w-full rounded-xl object-cover" />
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="font-bold text-ink-900">Property Details</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Stat label="Type" value={property.propertyType.replace(/_/g, " ")} />
              <Stat label="Condition" value={property.condition.replace(/_/g, " ")} />
              <Stat label="Bedrooms" value={String(property.bedrooms)} />
              <Stat label="Bathrooms" value={String(property.bathrooms)} />
              <Stat label="Square Feet" value={property.squareFeet.toLocaleString()} />
              <Stat label="Year Built" value={property.yearBuilt ? String(property.yearBuilt) : "—"} />
            </dl>
          </div>

          {property.status === "AUCTION_LIVE" && (
            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-ink-900">Live Investor Auction</h2>
                <span className="live-pulse h-2.5 w-2.5 rounded-full bg-cash-500" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-ink-500">Investors bidding</p>
                  <p className="text-xl font-bold text-ink-900">{new Set(property.bids.map((b) => b.investorId)).size}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Total bids</p>
                  <p className="text-xl font-bold text-ink-900">{property.bids.length}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Time remaining</p>
                  <p className="text-xl text-ink-900">
                    {property.auctionEndsAt && <CountdownTimer endsAt={property.auctionEndsAt.toISOString()} />}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs text-ink-500">
                Your guaranteed offer stays fixed no matter how high investors bid — competition only works in
                your favor.
              </p>
            </div>
          )}

          {(property.status === "AWARDED" || property.status === "CONTRACT_SIGNED" || property.status === "CLOSED") && (
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-6">
              <h2 className="font-bold text-ink-900">🎉 Your property was awarded!</h2>
              <p className="mt-2 text-sm text-ink-600">
                An investor won the bidding at {formatCurrency(property.winningBidAmount)}. Our closing team will
                reach out with next steps to finalize the contract.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-cash-100 bg-cash-50 p-6">
            <p className="text-sm font-semibold text-cash-700">Your Guaranteed Offer</p>
            <p className="mt-1 text-3xl font-extrabold text-ink-900">{formatCurrency(property.offerPrice)}</p>
            {property.offerPrice ? (
              <p className="mt-2 text-xs text-ink-500">
                Calculated as the lower of (ARV − rehab cost) and (80% of Zillow Estimate), guaranteed regardless
                of auction outcome.
              </p>
            ) : (
              <p className="mt-2 text-xs text-ink-500">
                Our team is reviewing your submission and will have an offer ready shortly.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-6 text-sm">
            <h3 className="font-bold text-ink-900">Submission Summary</h3>
            <dl className="mt-3 space-y-2">
              <Row label="Zillow Estimate" value={formatCurrency(property.zillowEstimate)} />
              <Row label="After Repair Value" value={formatCurrency(property.afterRepairValue)} />
              <Row label="Est. Rehab Cost" value={formatCurrency(property.rehabCost)} />
              <Row label="Submitted" value={property.createdAt.toLocaleDateString()} />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className="font-semibold capitalize text-ink-900">{value.toLowerCase()}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
