import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { proofOfFundsSchema } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const docs = await prisma.proofOfFunds.findMany({
    where: { investorId: session.userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ docs });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = proofOfFundsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  if (!body.documentUrl || !body.documentName) {
    return NextResponse.json({ error: "Upload a document first" }, { status: 400 });
  }

  const doc = await prisma.proofOfFunds.create({
    data: {
      investorId: session.userId,
      fundsAmount: parsed.data.fundsAmount,
      sourceType: parsed.data.sourceType,
      documentUrl: body.documentUrl,
      documentName: body.documentName,
      status: "PENDING",
    },
  });

  return NextResponse.json({ doc });
}
