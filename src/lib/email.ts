import { Resend } from "resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "OfferLup <onboarding@resend.dev>";

/**
 * Without a RESEND_API_KEY (e.g. local dev), log the email instead of
 * sending it so the reset flow is still fully testable without a real
 * provider configured.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email:dev] Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Reset your OfferLup password",
    html: `
      <p>We got a request to reset your OfferLup password.</p>
      <p><a href="${resetUrl}">Click here to choose a new password</a>. This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}
