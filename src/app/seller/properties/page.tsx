import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusPill } from "@/components/StatusPill";
import { formatCurrency } from "@/lib/offer";

export default async function SellerPropertiesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const properties = await prisma.property.findMany({
    where: { sellerId: session.userId },
    include: { photos: { take: 1, orderBy: { sortOrder: "asc" } }, _count: { select: { bids: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink-900">My Properties</h1>
        <Link href="/sell" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          + Submit Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
          <p className="text-ink-500">You haven&apos;t submitted a property yet.</p>
          <Link href="/sell" className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Get My Cash Offer
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <Link
              key={p.id}
              href={`/seller/properties/${p.id}`}
              className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-36 items-center justify-center bg-ink-100 text-ink-300">
                {p.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photos[0].url} alt={p.addressLine1} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm">No photo yet</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink-900">{p.addressLine1}</p>
                    <p className="text-sm text-ink-500">{p.city}, {p.state} {p.zip}</p>
                  </div>
                  <StatusPill status={p.status} />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-ink-500">Guaranteed Offer</span>
                  <span className="font-bold text-ink-900">{formatCurrency(p.offerPrice)}</span>
                </div>
                {p.status === "AUCTION_LIVE" && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-ink-500">Bids so far</span>
                    <span className="font-semibold text-brand-600">{p._count.bids}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
