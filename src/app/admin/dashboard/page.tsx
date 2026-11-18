import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/offer";
import { AdminPipelineTable } from "@/components/AdminPipelineTable";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default async function AdminDashboard() {
  const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS);

  const properties = await prisma.property.findMany({
    include: {
      seller: true,
      _count: { select: { bids: true } },
      bids: { orderBy: { amount: "desc" }, take: 1, select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const [pendingPof, totalSellers, totalInvestors, newSellers, newInvestors] = await Promise.all([
    prisma.proofOfFunds.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.user.count({ where: { role: "INVESTOR" } }),
    prisma.user.count({ where: { role: "SELLER", createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { role: "INVESTOR", createdAt: { gte: sevenDaysAgo } } }),
  ]);

  const totalFees = properties.reduce((sum, p) => sum + (p.platformFeeAmount ?? 0), 0);
  const needsReview = properties.filter((p) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW").length;
  const liveProperties = properties.filter((p) => p.status === "AUCTION_LIVE");
  const live = liveProperties.length;
  const liveSalesVolume = liveProperties.reduce(
    (sum, p) => sum + (p.bids[0]?.amount ?? p.startingBid ?? 0),
    0
  );
  const awarded = properties.filter((p) => ["AWARDED", "CONTRACT_SIGNED", "CLOSED"].includes(p.status)).length;
  const newProperties = properties.filter((p) => p.createdAt >= sevenDaysAgo).length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink-900">Pipeline Overview</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Needs Review" value={String(needsReview)} accent="amber" />
        <StatCard label="Live Auctions" value={String(live)} accent="brand" />
        <StatCard label="Deals Awarded" value={String(awarded)} accent="violet" />
        <StatCard label="Platform Fees Earned" value={formatCurrency(totalFees)} accent="cash" />
      </div>

      <h2 className="mt-8 text-lg font-bold text-ink-900">Live Sales &amp; Properties</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Live Sales Volume" value={formatCurrency(liveSalesVolume)} accent="cash" />
        <StatCard label="Total Properties" value={String(properties.length)} accent="brand" />
        <StatCard label="New Properties (7d)" value={String(newProperties)} accent="violet" />
        <StatCard label="Avg. Live Bid" value={formatCurrency(live > 0 ? liveSalesVolume / live : 0)} accent="amber" />
      </div>

      <h2 className="mt-8 text-lg font-bold text-ink-900">Users</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Sellers" value={String(totalSellers)} accent="brand" />
        <StatCard label="Total Buyers" value={String(totalInvestors)} accent="violet" />
        <StatCard label="New Sellers (7d)" value={String(newSellers)} accent="amber" />
        <StatCard label="New Buyers (7d)" value={String(newInvestors)} accent="cash" />
      </div>
      <p className="mt-2 text-sm text-ink-500">
        Full buyer-by-buyer stats — deals won, total purchased, avg. deal size —{" "}
        <Link href="/admin/investors" className="font-semibold text-brand-600">live on the Buyers page</Link>.
      </p>

      {pendingPof > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {pendingPof} proof of funds document{pendingPof === 1 ? "" : "s"} waiting on review.{" "}
          <Link href="/admin/proof-of-funds" className="font-semibold underline">Review now</Link>
        </div>
      )}

      <AdminPipelineTable properties={properties} />
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: "amber" | "brand" | "violet" | "cash" }) {
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
