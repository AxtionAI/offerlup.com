import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionCookie } from "@/lib/auth";
import { investorSignupSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = investorSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { fullName, email, phone, companyName, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      companyName,
      passwordHash,
      role: "INVESTOR",
    },
  });

  await createSessionCookie({ userId: user.id, role: user.role, email: user.email });

  return NextResponse.json({ ok: true, userId: user.id });
}
