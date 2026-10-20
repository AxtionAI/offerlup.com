import { NextRequest, NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  const subdir = (formData.get("subdir") as string) || "misc";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const url = await saveUploadedFile(file, subdir);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
