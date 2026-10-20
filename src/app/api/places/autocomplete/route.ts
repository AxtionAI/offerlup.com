import { NextRequest, NextResponse } from "next/server";
import { autocompleteAddress } from "@/lib/places";

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input")?.trim() ?? "";
  const sessionToken = req.nextUrl.searchParams.get("sessionToken") ?? "";

  if (input.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }
  if (!sessionToken) {
    return NextResponse.json({ error: "Missing sessionToken" }, { status: 400 });
  }

  try {
    const suggestions = await autocompleteAddress(input, sessionToken);
    return NextResponse.json({ suggestions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Address lookup failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
