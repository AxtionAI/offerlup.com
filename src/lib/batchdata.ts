import { prisma } from "@/lib/prisma";

const BATCHDATA_LOOKUP_URL = "https://api.batchdata.com/api/v1/property/lookup/all-attributes";

type LookupAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

/**
 * Looks up a property with BatchData's property/lookup/all-attributes endpoint and stores
 * the result on PropertyEnrichment. Never throws — a BatchData outage or a no-match address
 * should not affect the seller submission flow, which has already completed by the time
 * this runs (see `after()` in the properties POST route).
 */
export async function enrichProperty(propertyId: string, address: LookupAddress) {
  const apiKey = process.env.BATCHDATA_API_KEY;
  if (!apiKey) {
    console.log(`[batchdata:dev] Skipping enrichment for ${propertyId} — no BATCHDATA_API_KEY set.`);
    return;
  }

  try {
    const res = await fetch(BATCHDATA_LOOKUP_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests: [{ address }] }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      await prisma.propertyEnrichment.upsert({
        where: { propertyId },
        create: { propertyId, status: "ERROR", errorMessage: `HTTP ${res.status}: ${errorBody.slice(0, 500)}` },
        update: { status: "ERROR", errorMessage: `HTTP ${res.status}: ${errorBody.slice(0, 500)}`, fetchedAt: new Date() },
      });
      return;
    }

    const json = await res.json();
    const property = json?.results?.properties?.[0] ?? null;

    if (!property) {
      await prisma.propertyEnrichment.upsert({
        where: { propertyId },
        create: { propertyId, status: "NO_MATCH" },
        update: { status: "NO_MATCH", data: undefined, fetchedAt: new Date() },
      });
      return;
    }

    await prisma.propertyEnrichment.upsert({
      where: { propertyId },
      create: { propertyId, status: "MATCHED", data: property },
      update: { status: "MATCHED", data: property, errorMessage: null, fetchedAt: new Date() },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[batchdata] Enrichment failed for property ${propertyId}: ${message}`);
    await prisma.propertyEnrichment.upsert({
      where: { propertyId },
      create: { propertyId, status: "ERROR", errorMessage: message },
      update: { status: "ERROR", errorMessage: message, fetchedAt: new Date() },
    }).catch(() => {});
  }
}
