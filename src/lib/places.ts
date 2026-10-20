const PLACES_API_BASE = "https://places.googleapis.com/v1";

export type PlaceSuggestion = {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
};

export type ParsedAddress = {
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  county: string;
};

function apiKey() {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY is not configured.");
  return key;
}

export async function autocompleteAddress(input: string, sessionToken: string): Promise<PlaceSuggestion[]> {
  const res = await fetch(`${PLACES_API_BASE}/places:autocomplete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey(),
    },
    body: JSON.stringify({
      input,
      sessionToken,
      includedRegionCodes: ["us"],
      includedPrimaryTypes: ["street_address", "subpremise", "premise"],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Places autocomplete failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const suggestions = (data.suggestions ?? []) as Array<{
    placePrediction?: {
      placeId: string;
      text?: { text: string };
      structuredFormat?: {
        mainText?: { text: string };
        secondaryText?: { text: string };
      };
    };
  }>;

  return suggestions
    .filter((s) => s.placePrediction)
    .map((s) => ({
      placeId: s.placePrediction!.placeId,
      text: s.placePrediction!.text?.text ?? "",
      mainText: s.placePrediction!.structuredFormat?.mainText?.text ?? s.placePrediction!.text?.text ?? "",
      secondaryText: s.placePrediction!.structuredFormat?.secondaryText?.text ?? "",
    }));
}

export async function getPlaceAddress(placeId: string, sessionToken: string): Promise<ParsedAddress> {
  const res = await fetch(
    `${PLACES_API_BASE}/places/${encodeURIComponent(placeId)}?fields=addressComponents&sessionToken=${encodeURIComponent(sessionToken)}`,
    {
      headers: { "X-Goog-Api-Key": apiKey() },
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Place details failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const components = (data.addressComponents ?? []) as Array<{
    longText: string;
    shortText: string;
    types: string[];
  }>;

  const find = (type: string) => components.find((c) => c.types.includes(type));

  const streetNumber = find("street_number")?.longText ?? "";
  const route = find("route")?.longText ?? "";
  const city =
    find("locality")?.longText ??
    find("sublocality")?.longText ??
    find("postal_town")?.longText ??
    "";
  const state = find("administrative_area_level_1")?.shortText ?? "";
  const zip = find("postal_code")?.longText ?? "";
  const county = (find("administrative_area_level_2")?.longText ?? "").replace(/ County$/i, "");

  return {
    addressLine1: [streetNumber, route].filter(Boolean).join(" "),
    city,
    state,
    zip,
    county,
  };
}
