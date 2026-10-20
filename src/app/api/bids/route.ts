import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { bidSchema } from "@/lib/validation";
import { settleAuctionIfNeeded } from "@/lib/auction";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bid" }, { status: 400 });
  }
  const { propertyId, amount } = parsed.data;

  const hasVerifiedFunds = await prisma.proofOfFunds.findFirst({
    where: { investorId: session.userId, status: "VERIFIED" },
  });
  if (!hasVerifiedFunds) {
    return NextResponse.json(
      { error: "You need at least one verified Proof of Funds on file before bidding." },
      { status: 403 }
    );
  }

  await settleAuctionIfNeeded(propertyId);

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { bids: { orderBy: { amount: "desc" } } },
  });
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });
  if (property.status !== "AUCTION_LIVE") {
    return NextResponse.json({ error: "This auction is not currently live." }, { status: 400 });
  }
  if (property.auctionEndsAt && property.auctionEndsAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "This auction has just ended." }, { status: 400 });
  }

  const currentTop = property.bids[0];
  const minRequired = currentTop
    ? currentTop.amount + property.minBidIncrement
    : property.startingBid ?? 0;

  if (amount < minRequired) {
    return NextResponse.json(
      { error: `Your bid must be at least $${minRequired.toLocaleString()}.` },
      { status: 400 }
    );
  }

  const bid = await prisma.$transaction(async (tx) => {
    await tx.bid.updateMany({
      where: { propertyId, status: { in: ["ACTIVE", "WINNING"] } },
      data: { status: "OUTBID" },
    });

    const newBid = await tx.bid.create({
      data: {
        propertyId,
        investorId: session.userId,
        amount,
        status: "WINNING",
      },
    });

    if (currentTop && currentTop.investorId !== session.userId) {
      await tx.notification.create({
        data: {
          userId: currentTop.investorId,
          title: "You've been outbid",
          body: `Someone bid $${amount.toLocaleString()} on ${property.addressLine1}. Jump back in before the clock runs out.`,
          link: `/investor/auctions/${propertyId}`,
        },
      });
    }

    return newBid;
  });

  return NextResponse.json({ bid });
}
