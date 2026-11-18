import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/offer";
import { AdminInvestorsTable } from "@/components/AdminInvestorsTable";

export default async function AdminInvestorsPage() {
  const investors = await prisma.user.findMany({
    where: { role: "INVESTOR" },
    include: {
      buyBoxes: { include: { markets: true } },
      proofOfFunds: { orderBy: { createdAt: "desc" }, take: 1 },
      wonAuctions: {
        select: {
          id: true,
          addressLine1: true,
          city: true,
          state: true,
          status: true,
          winningBidAmount: true,
          updatedAt: true,
        },
      },
      _count: { select: { bids: true, buyBoxes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalInvestors = investors.length;
  const totalPurchased = investors.reduce(
    (sum, inv) => sum + inv.wonAuctions.reduce((s, p) => s + (p.winningBidAmount ?? 0), 0),
    0
  );
  const totalDealsWon = investors.reduce((sum, inv) => sum + inv.wonAuctions.length, 0);
  const avgDealSize = totalDealsWon > 0 ? totalPurchased / totalDealsWon : 0;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink-900">Buyers (Investors)</h1>
      <p className="mt-1 text-sm text-ink-500">
        Every registered investor, what they&apos;ve bought, how much they&apos;ve spent, and where they buy.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Buyers" value={String(totalInvestors)} accent="brand" />
        <StatCard label="Deals Won" value={String(totalDealsWon)} accent="violet" />
        <StatCard label="Total Purchased" value={formatCurrency(totalPurchased)} accent="cash" />
        <StatCard label="Avg. Deal Size" value={formatCurrency(avgDealSize)} accent="amber" />
      </div>

      <AdminInvestorsTable
        investors={investors.map((inv) => ({
          id: inv.id,
          fullName: inv.fullName,
          email: inv.email,
          phone: inv.phone,
          companyName: inv.companyName,
          createdAt: inv.createdAt.toISOString(),
          bidCount: inv._count.bids,
          buyBoxCount: inv._count.buyBoxes,
          proofOfFundsStatus: inv.proofOfFunds[0]?.status ?? null,
          proofOfFundsAmount: inv.proofOfFunds[0]?.fundsAmount ?? null,
          targetMarkets: inv.buyBoxes.flatMap((bb) =>
            bb.markets.map((m) => m.label)
          ),
          purchases: inv.wonAuctions.map((p) => ({
            id: p.id,
            address: p.addressLine1,
            city: p.city,
            state: p.state,
            status: p.status,
            amount: p.winningBidAmount,
            updatedAt: p.updatedAt.toISOString(),
          })),
        }))}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "amber" | "brand" | "violet" | "cash";
}) {
  const colors: Record<string, string> = {
    amber: "text-amber-600",
    brand: "text-brand-600",
    violet: "text-violet-600",
    cash: "text-cash-600",
  };
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${colors[accent]}`}>{value}</p>
    </div>
  );
}
