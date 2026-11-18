const TEXTGRID_BASE_URL = "https://api.textgrid.com/2010-04-01";

function toE164(rawPhone: string): string | null {
  const digits = rawPhone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export async function sendPasswordResetText(toPhone: string, resetUrl: string) {
  const accountSid = process.env.TEXTGRID_ACCOUNT_SID;
  const authToken = process.env.TEXTGRID_AUTH_TOKEN;
  const fromNumber = process.env.TEXTGRID_FROM_NUMBER;

  const to = toE164(toPhone);
  if (!to) {
    console.log(`[sms:dev] Skipping reset text — unparseable phone number: ${toPhone}`);
    return;
  }

  const body = `OfferLup: Reset your password: ${resetUrl} (expires in 1 hour)`;

  if (!accountSid || !authToken || !fromNumber) {
    console.log(`[sms:dev] Password reset text for ${to}: ${body}`);
    return;
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const res = await fetch(`${TEXTGRID_BASE_URL}/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: fromNumber, to, body }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`[sms] TextGrid send failed (${res.status}): ${errorBody}`);
  }
}
