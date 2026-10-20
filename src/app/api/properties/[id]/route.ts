import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { settleAuctionIfNeeded } from "@/lib/auction";

const AUCTION_VISIBLE_STATUSES = ["AUCTION_LIVE", "AUCTION_ENDED", "AWARDED", "CONTRACT_SIGNED", "CLOSED"];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await settleAuctionIfNeeded(id);

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      bids: { orderBy: { amount: "desc" }, include: { investor: true } },
      seller: true,
      awardedInvestor: true,
    },
  });

  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role === "SELLER" && property.sellerId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.role === "INVESTOR" && !AUCTION_VISIBLE_STATUSES.includes(property.status)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ property });
}
