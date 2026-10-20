import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const buyBox = await prisma.buyBox.findUnique({ where: { id } });
  if (!buyBox || buyBox.investorId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await prisma.buyBox.update({
    where: { id },
    data: { active: Boolean(body.active) },
  });

  return NextResponse.json({ buyBox: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const buyBox = await prisma.buyBox.findUnique({ where: { id } });
  if (!buyBox || buyBox.investorId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.buyBox.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
