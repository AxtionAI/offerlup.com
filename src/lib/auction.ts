import { prisma } from "./prisma";
import { calculateInvestorCost } from "./offer";

/**
 * This demo has no background worker, so an auction's end is settled lazily:
 * whenever a property is read and its auction window has lapsed, we close it
 * out right then (award the top bid, notify everyone, flip status).
 */
export async function settleAuctionIfNeeded(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { bids: { orderBy: { amount: "desc" } } },
  });
  if (!property) return null;
  if (property.status !== "AUCTION_LIVE") return property;
  if (!property.auctionEndsAt || property.auctionEndsAt.getTime() > Date.now()) return property;

  return settleAuction(propertyId);
}

export async function settleAuction(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { bids: { orderBy: { amount: "desc" } } },
  });
  if (!property) return null;

  const topBid = property.bids[0];

  if (!topBid) {
    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: { status: "AUCTION_ENDED" },
    });
    await prisma.notification.create({
      data: {
        userId: property.sellerId,
        title: "Your auction ended with no bids",
        body: `${property.addressLine1} didn't receive investor bids this round. Our team will reach out about next steps.`,
        link: `/seller/properties/${property.id}`,
      },
    });
    return updated;
  }

  const { platformFee } = calculateInvestorCost(topBid.amount);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.bid.update({ where: { id: topBid.id }, data: { status: "WON" } });
    await tx.bid.updateMany({
      where: { propertyId, id: { not: topBid.id } },
      data: { status: "LOST" },
    });

    const prop = await tx.property.update({
      where: { id: propertyId },
      data: {
        status: "AWARDED",
        awardedInvestorId: topBid.investorId,
        winningBidAmount: topBid.amount,
        platformFeeAmount: platformFee,
      },
    });

    await tx.notification.create({
      data: {
        userId: topBid.investorId,
        title: "You won the auction!",
        body: `Your bid of $${topBid.amount.toLocaleString()} won ${property.addressLine1}. A 6% platform fee ($${platformFee.toLocaleString()}) applies at closing.`,
        link: `/investor/auctions/${property.id}`,
      },
    });

    const losers = await tx.bid.findMany({
      where: { propertyId, id: { not: topBid.id } },
      distinct: ["investorId"],
    });
    for (const loser of losers) {
      await tx.notification.create({
        data: {
          userId: loser.investorId,
          title: "Auction closed — you were outbid",
          body: `${property.addressLine1} sold for $${topBid.amount.toLocaleString()}. Keep an eye out for new matches.`,
          link: `/investor/auctions/${property.id}`,
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: property.sellerId,
        title: "Your property was awarded!",
        body: `An investor won the auction for ${property.addressLine1}. Your guaranteed offer of $${(property.offerPrice ?? 0).toLocaleString()} stays the same.`,
        link: `/seller/properties/${property.id}`,
      },
    });

    return prop;
  });

  return updated;
}
