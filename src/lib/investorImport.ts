import { randomBytes } from "crypto";

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** Avoids visually ambiguous characters (0/O, 1/l/I) since admins relay these by hand. */
export function generateTempPassword(length = 12): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += PASSWORD_CHARS[bytes[i] % PASSWORD_CHARS.length];
  return out;
}

export function parseList(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export type ParsedMarket = { label: string; city?: string; state?: string; zip?: string };

/** Splits on ; or | only (not comma) so "Phoenix, AZ" survives as one market label. */
export function parseMarkets(raw?: string): ParsedMarket[] {
  if (!raw) return [];
  return raw
    .split(/[;|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((label): ParsedMarket => {
      const cityState = label.match(/^(.+?),\s*([A-Za-z]{2})$/);
      if (cityState) return { label, city: cityState[1].trim(), state: cityState[2].toUpperCase() };
      if (/^\d{5}$/.test(label)) return { label, zip: label };
      return { label };
    });
}

export function parseOptionalNumber(raw?: string): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

export function parseBoolean(raw?: string): boolean {
  if (!raw) return false;
  return /^(y|yes|true|1)$/i.test(raw.trim());
}

export function normalizePropertyType(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  if (/(single|sfr|sfh)/.test(v)) return "SINGLE_FAMILY";
  if (/(multi|duplex|triplex|fourplex|2-4|units)/.test(v)) return "MULTI_FAMILY";
  if (/condo/.test(v)) return "CONDO";
  if (/town/.test(v)) return "TOWNHOME";
  if (/land/.test(v)) return "LAND";
  if (/(mobile|manufactured)/.test(v)) return "MOBILE_HOME";
  return null;
}

export function normalizeCondition(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  if (/(full rehab|fixer|distressed|tear.?down|gut)/.test(v)) return "NEEDS_FULL_REHAB";
  if (/(moderate|dated)/.test(v)) return "NEEDS_MODERATE_WORK";
  if (/(cosmetic|light)/.test(v)) return "LIGHT_COSMETIC";
  if (/(move.?in|turnkey|ready)/.test(v)) return "MOVE_IN_READY";
  return null;
}
