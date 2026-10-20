import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const status = body.status === "VERIFIED" ? "VERIFIED" : body.status === "REJECTED" ? "REJECTED" : null;
  if (!status) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const doc = await prisma.proofOfFunds.update({
    where: { id },
    data: { status, reviewerNote: body.reviewerNote },
  });

  await prisma.notification.create({
    data: {
      userId: doc.investorId,
      title: status === "VERIFIED" ? "Proof of Funds verified" : "Proof of Funds needs attention",
      body:
        status === "VERIFIED"
          ? `Your ${doc.sourceType} proof of funds ($${doc.fundsAmount.toLocaleString()}) is verified. You're clear to bid.`
          : `Your proof of funds document needs another look: ${doc.reviewerNote ?? "please resubmit."}`,
      link: `/investor/proof-of-funds`,
    },
  });

  return NextResponse.json({ doc });
}
