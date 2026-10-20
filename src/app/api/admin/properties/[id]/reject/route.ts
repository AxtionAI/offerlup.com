import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const property = await prisma.property.update({
    where: { id },
    data: { status: "REJECTED", rejectionReason: body.reason ?? "Doesn't meet current buy criteria." },
  });

  await prisma.notification.create({
    data: {
      userId: property.sellerId,
      title: "Update on your submission",
      body: `We're not able to make an offer on ${property.addressLine1} right now: ${property.rejectionReason}`,
      link: `/seller/properties/${property.id}`,
    },
  });

  return NextResponse.json({ property });
}
