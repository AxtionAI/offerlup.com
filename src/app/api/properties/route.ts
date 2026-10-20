import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionCookie, getSession } from "@/lib/auth";
import { sellerSubmissionSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = sellerSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;
  const photoUrls: string[] = Array.isArray(body.photoUrls) ? body.photoUrls : [];

  let seller = await prisma.user.findUnique({ where: { email: data.email } });

  if (seller && seller.role !== "SELLER") {
    return NextResponse.json(
      { error: "That email is already registered as a different account type." },
      { status: 409 }
    );
  }

  if (!seller) {
    const passwordHash = await hashPassword(data.password);
    seller = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: "SELLER",
      },
    });
  }

  const property = await prisma.property.create({
    data: {
      sellerId: seller.id,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state.toUpperCase(),
      zip: data.zip,
      county: data.county,
      propertyType: data.propertyType,
      condition: data.condition,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      squareFeet: data.squareFeet,
      yearBuilt: data.yearBuilt,
      lotSizeSqft: data.lotSizeSqft,
      stories: data.stories,
      garageSpaces: data.garageSpaces,
      hasPool: data.hasPool ?? false,
      hasHoa: data.hasHoa ?? false,
      hoaFeeMonthly: data.hoaFeeMonthly,
      features: JSON.stringify(data.features ?? []),
      zillowEstimate: data.zillowEstimate,
      occupancy: data.occupancy,
      challenges: JSON.stringify(data.challenges ?? []),
      reasonForSelling: data.reasonForSelling,
      timelineToSell: data.timelineToSell,
      askingPrice: data.askingPrice,
      status: "SUBMITTED",
      photos: {
        create: photoUrls.map((url, i) => ({ url, sortOrder: i })),
      },
    },
  });

  await createSessionCookie({ userId: seller.id, role: seller.role, email: seller.email });

  return NextResponse.json({ ok: true, propertyId: property.id });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "SELLER") {
    const properties = await prisma.property.findMany({
      where: { sellerId: session.userId },
      include: { photos: true, bids: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ properties });
  }

  if (session.role === "ADMIN") {
    const properties = await prisma.property.findMany({
      include: { photos: true, bids: true, seller: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ properties });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
