import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { buyBoxSchema } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const buyBoxes = await prisma.buyBox.findMany({
    where: { investorId: session.userId },
    include: { markets: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ buyBoxes });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = buyBoxSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  const buyBox = await prisma.buyBox.create({
    data: {
      investorId: session.userId,
      name: data.name,
      propertyTypes: JSON.stringify(data.propertyTypes),
      conditions: JSON.stringify(data.conditions),
      minBedrooms: data.minBedrooms,
      minBathrooms: data.minBathrooms,
      minSquareFeet: data.minSquareFeet,
      maxSquareFeet: data.maxSquareFeet,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      minYearBuilt: data.minYearBuilt,
      minGarageSpaces: data.minGarageSpaces,
      requiresPool: data.requiresPool ?? false,
      desiredFeatures: JSON.stringify(data.desiredFeatures ?? []),
      markets: {
        create: data.markets.map((m) => ({
          label: m.label,
          city: m.city,
          county: m.county,
          state: m.state,
          zip: m.zip,
        })),
      },
    },
    include: { markets: true },
  });

  return NextResponse.json({ buyBox });
}
