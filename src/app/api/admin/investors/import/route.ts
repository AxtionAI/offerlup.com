import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, hashPassword } from "@/lib/auth";
import { bulkInvestorRowSchema } from "@/lib/validation";
import {
  generateTempPassword,
  parseList,
  parseMarkets,
  parseOptionalNumber,
  parseBoolean,
  normalizePropertyType,
  normalizeCondition,
} from "@/lib/investorImport";

type ImportRowResult = {
  row: number;
  email: string;
  status: "created" | "skipped" | "error";
  message: string;
  tempPassword?: string;
};

const MAX_ROWS = 500;

export async function POST(req: NextRequest) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const rowsInput: unknown[] | null = Array.isArray(body?.rows) ? body.rows : null;
  if (!rowsInput || rowsInput.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }
  if (rowsInput.length > MAX_ROWS) {
    return NextResponse.json({ error: `Import is limited to ${MAX_ROWS} rows at a time` }, { status: 400 });
  }

  const results: ImportRowResult[] = new Array(rowsInput.length);
  const seenEmails = new Set<string>();
  const validRows: { index: number; data: ReturnType<typeof bulkInvestorRowSchema.parse> }[] = [];

  rowsInput.forEach((raw, index) => {
    const parsed = bulkInvestorRowSchema.safeParse(raw);
    if (!parsed.success) {
      const rawEmail = raw && typeof raw === "object" && "email" in raw ? (raw as { email?: unknown }).email : undefined;
      results[index] = {
        row: index + 1,
        email: typeof rawEmail === "string" ? rawEmail : "",
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Invalid row",
      };
      return;
    }
    const { email } = parsed.data;
    if (seenEmails.has(email)) {
      results[index] = { row: index + 1, email, status: "error", message: "Duplicate email within this file" };
      return;
    }
    seenEmails.add(email);
    validRows.push({ index, data: parsed.data });
  });

  if (validRows.length > 0) {
    const existing = await prisma.user.findMany({
      where: { email: { in: validRows.map((r) => r.data.email) } },
      select: { email: true },
    });
    const existingEmails = new Set(existing.map((u) => u.email));

    for (const { index, data } of validRows) {
      if (existingEmails.has(data.email)) {
        results[index] = { row: index + 1, email: data.email, status: "skipped", message: "Email already has an account" };
        continue;
      }

      try {
        const usedProvidedPassword = Boolean(data.password && data.password.length >= 6);
        const tempPassword = usedProvidedPassword ? (data.password as string) : generateTempPassword();
        const passwordHash = await hashPassword(tempPassword);

        const propertyTypes = parseList(data.propertyTypes)
          .map(normalizePropertyType)
          .filter((v): v is string => v !== null);
        const conditions = parseList(data.conditions)
          .map(normalizeCondition)
          .filter((v): v is string => v !== null);
        const markets = parseMarkets(data.markets);

        const canCreateBuyBox = propertyTypes.length > 0 && conditions.length > 0 && markets.length > 0;

        await prisma.user.create({
          data: {
            email: data.email,
            passwordHash,
            role: "INVESTOR",
            fullName: data.fullName,
            phone: data.phone || null,
            companyName: data.companyName || null,
            ...(canCreateBuyBox
              ? {
                  buyBoxes: {
                    create: {
                      name: data.buyBoxName || "Imported Buy Box",
                      propertyTypes: JSON.stringify(propertyTypes),
                      conditions: JSON.stringify(conditions),
                      minPrice: parseOptionalNumber(data.minPrice),
                      maxPrice: parseOptionalNumber(data.maxPrice),
                      minBedrooms: parseOptionalNumber(data.minBedrooms),
                      minBathrooms: parseOptionalNumber(data.minBathrooms),
                      minSquareFeet: parseOptionalNumber(data.minSquareFeet),
                      maxSquareFeet: parseOptionalNumber(data.maxSquareFeet),
                      minYearBuilt: parseOptionalNumber(data.minYearBuilt),
                      minGarageSpaces: parseOptionalNumber(data.minGarageSpaces),
                      requiresPool: parseBoolean(data.requiresPool),
                      markets: { create: markets },
                    },
                  },
                }
              : {}),
          },
        });

        results[index] = {
          row: index + 1,
          email: data.email,
          status: "created",
          message: canCreateBuyBox
            ? "Investor + buy box created"
            : "Investor created — map markets, property types, and conditions to also create a buy box",
          tempPassword: usedProvidedPassword ? undefined : tempPassword,
        };
      } catch {
        results[index] = { row: index + 1, email: data.email, status: "error", message: "Failed to create account" };
      }
    }
  }

  const summary = {
    created: results.filter((r) => r.status === "created").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    errors: results.filter((r) => r.status === "error").length,
  };

  return NextResponse.json({ summary, results });
}
