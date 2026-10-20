import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const unreadCount = await prisma.notification.count({
    where: { userId: session.userId, read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await prisma.notification.updateMany({
    where: { userId: session.userId, ...(body.id ? { id: body.id } : {}) },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}
