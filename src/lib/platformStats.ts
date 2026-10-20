import { prisma } from "@/lib/prisma";

export async function getLiveBuyerStats() {
  const [verifiedInvestorCount, liveAuctionCount, activeBuyBoxCount, recentBidsRaw] = await Promise.all([
    prisma.proofOfFunds.findMany({
      where: { status: "VERIFIED" },
      distinct: ["investorId"],
      select: { investorId: true },
    }),
    prisma.property.count({ where: { status: "AUCTION_LIVE" } }),
    prisma.buyBox.count({ where: { active: true } }),
    prisma.bid.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { property: { select: { city: true, state: true } }, investor: { select: { id: true } } },
    }),
  ]);

  const recentBids = recentBidsRaw.map((b) => ({
    id: b.id,
    amount: b.amount,
    createdAt: b.createdAt,
    city: b.property.city,
    state: b.property.state,
    investorLabel: `Investor #${b.investor.id.slice(-4).toUpperCase()}`,
  }));

  return {
    verifiedInvestorCount: verifiedInvestorCount.length,
    liveAuctionCount,
    activeBuyBoxCount,
    recentBids,
  };
}
