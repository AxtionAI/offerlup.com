import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
};

/**
 * Vercel's production filesystem is read-only outside of a short-lived
 * /tmp per invocation, so writes to public/uploads only work in local dev.
 * In production we store files in Vercel Blob instead. Newer Blob stores
 * connect via OIDC (BLOB_STORE_ID + the ambient VERCEL_OIDC_TOKEN, both
 * injected automatically) rather than a static BLOB_READ_WRITE_TOKEN; the
 * SDK's put() auto-detects whichever credential is present, so this just
 * needs to gate on either one being set.
 */
export async function saveUploadedFile(file: File, subdir: string) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Use JPG, PNG, WEBP, GIF, or PDF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File is too large (10MB max).");
  }

  const safeSubdir = subdir.replace(/[^a-zA-Z0-9_-]/g, "");
  const ext = EXT_BY_TYPE[file.type] ?? "";
  const filename = `${crypto.randomUUID()}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
    const blob = await put(`${safeSubdir}/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads", safeSubdir);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${safeSubdir}/${filename}`;
}
