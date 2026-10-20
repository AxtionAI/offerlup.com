import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSessionCookie({ userId: user.id, role: user.role, email: user.email });

  return NextResponse.json({ ok: true, role: user.role });
}
