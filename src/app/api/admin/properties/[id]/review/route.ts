import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { calculateOfferPrice } from "@/lib/offer";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const afterRepairValue = Number(body.afterRepairValue);
  const rehabCost = Number(body.rehabCost);
  const zillowEstimate = body.zillowEstimate !== undefined ? Number(body.zillowEstimate) : undefined;

  if (!Number.isFinite(afterRepairValue) || !Number.isFinite(rehabCost)) {
    return NextResponse.json({ error: "Enter a valid ARV and rehab cost." }, { status: 400 });
  }

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const effectiveZillow = zillowEstimate ?? property.zillowEstimate;
  const { offerPrice } = calculateOfferPrice(afterRepairValue, rehabCost, effectiveZillow);

  const updated = await prisma.property.update({
    where: { id },
    data: {
      afterRepairValue,
      rehabCost,
      zillowEstimate: effectiveZillow,
      offerPrice,
      status: "OFFER_READY",
    },
  });

  await prisma.notification.create({
    data: {
      userId: property.sellerId,
      title: "Your cash offer is ready!",
      body: `We've calculated a guaranteed offer of $${offerPrice.toLocaleString()} for ${property.addressLine1}.`,
      link: `/seller/properties/${property.id}`,
    },
  });

  return NextResponse.json({ property: updated });
}
