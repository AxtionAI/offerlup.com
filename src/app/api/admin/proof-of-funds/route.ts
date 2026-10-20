import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const docs = await prisma.proofOfFunds.findMany({
    include: { investor: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ docs });
}
