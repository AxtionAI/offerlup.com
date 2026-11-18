import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/auth";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendPasswordResetEmail } from "@/lib/email";
import { sendPasswordResetText } from "@/lib/sms";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond the same way whether or not the account exists, so this
  // endpoint can't be used to discover which emails are registered.
  if (user) {
    const { rawToken, tokenHash } = generateResetToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const origin = req.nextUrl.origin;
    const resetUrl = `${origin}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
    if (user.phone) {
      await sendPasswordResetText(user.phone, resetUrl);
    }
  }

  return NextResponse.json({ ok: true });
}
