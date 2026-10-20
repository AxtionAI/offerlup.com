import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/offer";
import { AdminPipelineTable } from "@/components/AdminPipelineTable";

export default async function AdminDashboard() {
  const properties = await prisma.property.findMany({
    include: { seller: true, _count: { select: { bids: true } } },
    orderBy: { createdAt: "desc" },
  });

  const pendingPof = await prisma.proofOfFunds.count({ where: { status: "PENDING" } });

  const totalFees = properties.reduce((sum, p) => sum + (p.platformFeeAmount ?? 0), 0);
  const needsReview = properties.filter((p) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW").length;
  const live = properties.filter((p) => p.status === "AUCTION_LIVE").length;
  const awarded = properties.filter((p) => ["AWARDED", "CONTRACT_SIGNED", "CLOSED"].includes(p.status)).length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink-900">Pipeline Overview</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Needs Review" value={String(needsReview)} accent="amber" />
        <StatCard label="Live Auctions" value={String(live)} accent="brand" />
        <StatCard label="Deals Awarded" value={String(awarded)} accent="violet" />
        <StatCard label="Platform Fees Earned" value={formatCurrency(totalFees)} accent="cash" />
      </div>

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
