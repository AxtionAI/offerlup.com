import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (property.status !== "OFFER_READY") {
    return NextResponse.json({ error: "Only properties with a ready offer can be auctioned." }, { status: 400 });
  }

  const body = await req.json();
  const durationHours = Number(body.durationHours) || 48;
  const startingBid = Number(body.startingBid) || Math.round((property.offerPrice ?? 0) * 1.05);
  const minBidIncrement = Number(body.minBidIncrement) || 500;

  const auctionStartsAt = new Date();
  const auctionEndsAt = new Date(auctionStartsAt.getTime() + durationHours * 60 * 60 * 1000);

  const updated = await prisma.property.update({
    where: { id },
    data: {
      status: "AUCTION_LIVE",
      auctionStartsAt,
      auctionEndsAt,
      startingBid,
      minBidIncrement,
    },
  });

  await prisma.notification.create({
    data: {
      userId: property.sellerId,
      title: "Investors are now bidding on your property",
      body: `${property.addressLine1} went live to our investor network. Your guaranteed offer stays fixed regardless of the auction outcome.`,
      link: `/seller/properties/${property.id}`,
    },
  });

  return NextResponse.json({ property: updated });
}
