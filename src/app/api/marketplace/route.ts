import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { scoreMatch } from "@/lib/matching";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [properties, buyBoxes] = await Promise.all([
    prisma.property.findMany({
      where: { status: { in: ["AUCTION_LIVE", "AUCTION_ENDED", "AWARDED", "CLOSED"] } },
      include: {
        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
        bids: { orderBy: { amount: "desc" }, take: 1 },
        _count: { select: { bids: true } },
      },
      orderBy: { auctionEndsAt: "asc" },
    }),
    prisma.buyBox.findMany({
      where: { investorId: session.userId, active: true },
      include: { markets: true },
    }),
  ]);

  const listings = properties.map((property) => {
    const bestScore =
      buyBoxes.length === 0
        ? null
        : Math.max(...buyBoxes.map((bb) => scoreMatch(bb, property)));
    return {
      ...property,
      matchScore: bestScore,
      topBid: property.bids[0]?.amount ?? null,
      bidCount: property._count.bids,
    };
  });

  listings.sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1));

  return NextResponse.json({ listings, hasBuyBox: buyBoxes.length > 0 });
}
