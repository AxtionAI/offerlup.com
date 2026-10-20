import { NextRequest, NextResponse } from "next/server";
import { getPlaceAddress } from "@/lib/places";

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId")?.trim() ?? "";
  const sessionToken = req.nextUrl.searchParams.get("sessionToken") ?? "";

  if (!placeId) {
    return NextResponse.json({ error: "Missing placeId" }, { status: 400 });
  }
  if (!sessionToken) {
    return NextResponse.json({ error: "Missing sessionToken" }, { status: 400 });
  }

  try {
    const address = await getPlaceAddress(placeId, sessionToken);
    return NextResponse.json({ address });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Address lookup failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
