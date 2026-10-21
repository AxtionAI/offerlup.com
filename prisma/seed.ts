import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

function calcOffer(arv: number, rehab: number, zillow: number) {
  return Math.round(Math.max(0, Math.min(arv - rehab, zillow * 0.8)));
}

async function main() {
  console.log("Seeding database...");

  await prisma.notification.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.property.deleteMany();
  await prisma.buyBoxMarket.deleteMany();
  await prisma.buyBox.deleteMany();
  await prisma.proofOfFunds.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "adminbuys@offerlup.com",
      passwordHash: await hash("Investor123$"),
      role: "ADMIN",
      fullName: "AdminBuys",
    },
  });

  const investor1 = await prisma.user.create({
    data: {
      email: "jordan@brightpathcapital.com",
      passwordHash: await hash("investor123"),
      role: "INVESTOR",
      fullName: "Jordan Diaz",
      phone: "602-555-0142",
      companyName: "Bright Path Capital",
    },
  });

  const investor2 = await prisma.user.create({
    data: {
      email: "morgan@sunbeltreia.com",
      passwordHash: await hash("investor123"),
      role: "INVESTOR",
      fullName: "Morgan Kim",
      phone: "480-555-0199",
      companyName: "Sunbelt REIA",
    },
  });

  const investor3 = await prisma.user.create({
    data: {
      email: "riley@tranholdings.com",
      passwordHash: await hash("investor123"),
      role: "INVESTOR",
      fullName: "Riley Tran",
      phone: "623-555-0110",
      companyName: "Tran Holdings LLC",
    },
  });

  await prisma.buyBox.create({
    data: {
      investorId: investor1.id,
      name: "Maricopa County SFR Flips",
      propertyTypes: JSON.stringify(["SINGLE_FAMILY", "TOWNHOME"]),
      conditions: JSON.stringify(["NEEDS_FULL_REHAB", "NEEDS_MODERATE_WORK"]),
      minBedrooms: 2,
      minPrice: 100000,
      maxPrice: 400000,
      markets: { create: [{ label: "Maricopa County, AZ", county: "Maricopa", state: "AZ" }] },
    },
  });

  await prisma.buyBox.create({
    data: {
      investorId: investor2.id,
      name: "Phoenix Metro Value-Add",
      propertyTypes: JSON.stringify(["SINGLE_FAMILY", "MULTI_FAMILY", "CONDO"]),
      conditions: JSON.stringify(["NEEDS_MODERATE_WORK", "LIGHT_COSMETIC"]),
      minPrice: 150000,
      maxPrice: 500000,
      markets: { create: [{ label: "Phoenix, AZ", city: "Phoenix", state: "AZ" }, { label: "Glendale, AZ", city: "Glendale", state: "AZ" }] },
    },
  });

  await prisma.proofOfFunds.create({
    data: {
      investorId: investor1.id,
      documentName: "bright-path-bank-statement.pdf",
      documentUrl: "/demo/sample-pof.pdf",
      fundsAmount: 500000,
      sourceType: "Cash in bank",
      status: "VERIFIED",
    },
  });
  await prisma.proofOfFunds.create({
    data: {
      investorId: investor2.id,
      documentName: "sunbelt-reia-loc.pdf",
      documentUrl: "/demo/sample-pof.pdf",
      fundsAmount: 250000,
      sourceType: "Line of credit",
      status: "VERIFIED",
    },
  });
  await prisma.proofOfFunds.create({
    data: {
      investorId: investor3.id,
      documentName: "tran-holdings-hml.pdf",
      documentUrl: "/demo/sample-pof.pdf",
      fundsAmount: 300000,
      sourceType: "Hard money lender pre-approval",
      status: "PENDING",
    },
  });

  const sellers = await Promise.all(
    [
      { name: "Alex Rivera", email: "alex.rivera@example.com" },
      { name: "Casey Nguyen", email: "casey.nguyen@example.com" },
      { name: "Taylor Brooks", email: "taylor.brooks@example.com" },
      { name: "Jamie Foster", email: "jamie.foster@example.com" },
      { name: "Sam Patel", email: "sam.patel@example.com" },
    ].map((s) =>
      prisma.user.create({
        data: {
          email: s.email,
          passwordHash: bcrypt.hashSync("seller123", 10),
          role: "SELLER",
          fullName: s.name,
          phone: "602-555-0100",
        },
      })
    )
  );

  // 1. Freshly submitted, awaiting review
  await prisma.property.create({
    data: {
      sellerId: sellers[0].id,
      addressLine1: "118 Cactus Wren Rd",
      city: "Phoenix",
      state: "AZ",
      zip: "85017",
      county: "Maricopa",
      propertyType: "SINGLE_FAMILY",
      condition: "NEEDS_FULL_REHAB",
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1450,
      yearBuilt: 1978,
      zillowEstimate: 255000,
      occupancy: "Vacant",
      reasonForSelling: "Inherited the property and live out of state.",
      timelineToSell: "ASAP",
      status: "SUBMITTED",
    },
  });

  // 2. Reviewed, offer ready, not yet auctioned
  await prisma.property.create({
    data: {
      sellerId: sellers[1].id,
      addressLine1: "22 Desert Bloom Ave",
      city: "Mesa",
      state: "AZ",
      zip: "85201",
      county: "Maricopa",
      propertyType: "SINGLE_FAMILY",
      condition: "NEEDS_MODERATE_WORK",
      bedrooms: 4,
      bathrooms: 2,
      squareFeet: 1800,
      yearBuilt: 1985,
      zillowEstimate: 340000,
      afterRepairValue: 380000,
      rehabCost: 45000,
      offerPrice: calcOffer(380000, 45000, 340000),
      occupancy: "Owner occupied",
      reasonForSelling: "Relocating for work.",
      timelineToSell: "30_DAYS",
      status: "OFFER_READY",
    },
  });

  // 3. Live auction with active bidding
  const liveProperty = await prisma.property.create({
    data: {
      sellerId: sellers[2].id,
      addressLine1: "77 Ironwood Ln",
      city: "Glendale",
      state: "AZ",
      zip: "85301",
      county: "Maricopa",
      propertyType: "SINGLE_FAMILY",
      condition: "NEEDS_FULL_REHAB",
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1620,
      yearBuilt: 1972,
      zillowEstimate: 298000,
      afterRepairValue: 340000,
      rehabCost: 58000,
      offerPrice: calcOffer(340000, 58000, 298000),
      occupancy: "Vacant",
      reasonForSelling: "Downsizing after retirement.",
      timelineToSell: "ASAP",
      status: "AUCTION_LIVE",
      auctionStartsAt: new Date(),
      auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 20),
      startingBid: Math.round(calcOffer(340000, 58000, 298000) * 1.05),
      minBidIncrement: 500,
    },
  });

  const startingBid = liveProperty.startingBid ?? 0;
  await prisma.bid.create({
    data: { propertyId: liveProperty.id, investorId: investor2.id, amount: startingBid, status: "OUTBID" },
  });
  await prisma.bid.create({
    data: { propertyId: liveProperty.id, investorId: investor1.id, amount: startingBid + 2500, status: "OUTBID" },
  });
  await prisma.bid.create({
    data: { propertyId: liveProperty.id, investorId: investor2.id, amount: startingBid + 5500, status: "WINNING" },
  });

  // 4. Awarded & closed deal (historical)
  const closedProperty = await prisma.property.create({
    data: {
      sellerId: sellers[3].id,
      addressLine1: "9 Palo Verde Ct",
      city: "Tempe",
      state: "AZ",
      zip: "85281",
      county: "Maricopa",
      propertyType: "SINGLE_FAMILY",
      condition: "LIGHT_COSMETIC",
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1550,
      yearBuilt: 1991,
      zillowEstimate: 320000,
      afterRepairValue: 345000,
      rehabCost: 22000,
      offerPrice: calcOffer(345000, 22000, 320000),
      occupancy: "Owner occupied",
      timelineToSell: "FLEXIBLE",
      status: "CLOSED",
      auctionStartsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      auctionEndsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
      startingBid: 270000,
      winningBidAmount: 281500,
      platformFeeAmount: Math.round(281500 * 0.06),
      awardedInvestorId: investor1.id,
    },
  });
  await prisma.bid.create({
    data: { propertyId: closedProperty.id, investorId: investor1.id, amount: 281500, status: "WON" },
  });
  await prisma.bid.create({
    data: { propertyId: closedProperty.id, investorId: investor2.id, amount: 275000, status: "LOST" },
  });

  // 5. Rejected submission
  await prisma.property.create({
    data: {
      sellerId: sellers[4].id,
      addressLine1: "300 Rocky Point Dr",
      city: "Buckeye",
      state: "AZ",
      zip: "85326",
      propertyType: "LAND",
      condition: "NEEDS_FULL_REHAB",
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      zillowEstimate: 45000,
      status: "REJECTED",
      rejectionReason: "Outside our current vacant-land buy criteria.",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: investor1.id,
        title: "New match: 77 Ironwood Ln",
        body: "A new deal matching your Maricopa County buy box just went live.",
        link: `/investor/auctions/${liveProperty.id}`,
      },
      {
        userId: admin.id,
        title: "Welcome to the admin console",
        body: "Review new submissions, calculate offers, and manage live auctions here.",
        link: "/admin/dashboard",
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Login as admin:    adminbuys@offerlup.com / Investor123$");
  console.log("Login as investor: jordan@brightpathcapital.com / investor123");
  console.log("Login as investor: morgan@sunbeltreia.com / investor123 (has pending bid)");
  console.log("Login as seller:   casey.nguyen@example.com / seller123 (offer ready)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
