import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { settleAuction } from "@/lib/auction";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updated = await settleAuction(id);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ property: updated });
}
