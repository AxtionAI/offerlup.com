import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/offer";
import { StatusPill } from "@/components/StatusPill";
import { PropertyPlaceholder } from "@/components/illustrations/PropertyPlaceholder";

const SHOWCASE_STATUSES = ["AUCTION_LIVE", "AWARDED", "CONTRACT_SIGNED", "CLOSED", "OFFER_READY"] as const;

export async function PropertyShowcase({ limit = 6 }: { limit?: number }) {
  const properties = await prisma.property.findMany({
    where: { status: { in: [...SHOWCASE_STATUSES] } },
    include: { photos: { take: 1, orderBy: { sortOrder: "asc" } }, _count: { select: { bids: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (properties.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((p) => {
        const priceLabel =
          p.status === "AUCTION_LIVE"
            ? "Current bid"
            : p.status === "AWARDED" || p.status === "CONTRACT_SIGNED" || p.status === "CLOSED"
            ? "Awarded at"
            : "Guaranteed offer";
        const priceValue =
          p.status === "AUCTION_LIVE" || p.status === "AWARDED" || p.status === "CONTRACT_SIGNED" || p.status === "CLOSED"
            ? p.winningBidAmount ?? p.offerPrice
            : p.offerPrice;

        return (
          <div key={p.id} className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm transition hover:shadow-md">
            <div className="relative h-44 bg-ink-50">
              {p.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photos[0].url} alt="" className="h-full w-full object-cover" />
              ) : (
                <PropertyPlaceholder seed={p.id} className="h-full w-full" />
              )}
              <span className="absolute right-3 top-3">
                <StatusPill status={p.status} />
              </span>
            </div>
            <div className="p-5">
              <p className="font-semibold text-ink-900">
                {p.city}, {p.state} {p.zip}
              </p>
              <p className="mt-1 text-xs text-ink-400">
                {p.propertyType.replace(/_/g, " ")} · {p.bedrooms} bd · {p.bathrooms} ba · {p.squareFeet.toLocaleString()} sqft
              </p>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm">
                <div>
                  <p className="text-xs text-ink-500">{priceLabel}</p>
                  <p className="font-bold text-ink-900">{formatCurrency(priceValue)}</p>
                </div>
                {p._count.bids > 0 && (
                  <p className="text-xs font-semibold text-brand-600">{p._count.bids} bids</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
