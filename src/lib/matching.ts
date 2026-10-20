import type { BuyBox, BuyBoxMarket, Property } from "@prisma/client";

type BuyBoxWithMarkets = BuyBox & { markets: BuyBoxMarket[] };

/**
 * Trust-based match score between an investor's Smart Buy Box and a property.
 * Location is weighted heaviest (it's the hard filter real wholesalers care
 * about first), then price-box fit, property type, condition, and specs.
 */
export function scoreMatch(buyBox: BuyBoxWithMarkets, property: Property): number {
  let score = 0;
  let maxScore = 0;

  maxScore += 40;
  const locationHit = buyBox.markets.some((m) => {
    if (m.zip && m.zip === property.zip) return true;
    if (m.county && property.county && m.county.toLowerCase() === property.county.toLowerCase())
      return true;
    if (m.city && m.city.toLowerCase() === property.city.toLowerCase()) return true;
    if (m.state && !m.city && !m.county && !m.zip && m.state.toUpperCase() === property.state.toUpperCase())
      return true;
    return false;
  });
  if (locationHit) score += 40;

  maxScore += 20;
  const types: string[] = JSON.parse(buyBox.propertyTypes || "[]");
  if (types.includes(property.propertyType)) score += 20;

  maxScore += 15;
  const conditions: string[] = JSON.parse(buyBox.conditions || "[]");
  if (conditions.includes(property.condition)) score += 15;

  maxScore += 15;
  const price = property.offerPrice ?? property.askingPrice ?? property.zillowEstimate;
  const minOk = buyBox.minPrice == null || price >= buyBox.minPrice;
  const maxOk = buyBox.maxPrice == null || price <= buyBox.maxPrice;
  if (minOk && maxOk) score += 15;

  maxScore += 10;
  const bedOk = buyBox.minBedrooms == null || property.bedrooms >= buyBox.minBedrooms;
  const bathOk = buyBox.minBathrooms == null || property.bathrooms >= buyBox.minBathrooms;
  const sqftMinOk = buyBox.minSquareFeet == null || property.squareFeet >= buyBox.minSquareFeet;
  const sqftMaxOk = buyBox.maxSquareFeet == null || property.squareFeet <= buyBox.maxSquareFeet;
  if (bedOk && bathOk && sqftMinOk && sqftMaxOk) score += 10;

  // Amenity fit: pool/garage are near-hard requirements when set, desired
  // features are a soft bonus for partial overlap rather than all-or-nothing.
  maxScore += 10;
  const poolOk = !buyBox.requiresPool || property.hasPool;
  const garageOk = buyBox.minGarageSpaces == null || (property.garageSpaces ?? 0) >= buyBox.minGarageSpaces;
  const desired: string[] = JSON.parse(buyBox.desiredFeatures || "[]");
  const propertyFeatures: string[] = JSON.parse(property.features || "[]");
  const featureRatio =
    desired.length === 0 ? 1 : desired.filter((f) => propertyFeatures.includes(f)).length / desired.length;
  if (poolOk && garageOk) score += 5 + 5 * featureRatio;

  return Math.round((score / maxScore) * 100);
}

export function isLocationMatch(buyBox: BuyBoxWithMarkets, property: Property) {
  return buyBox.markets.some((m) => {
    if (m.zip && m.zip === property.zip) return true;
    if (m.county && property.county && m.county.toLowerCase() === property.county.toLowerCase())
      return true;
    if (m.city && m.city.toLowerCase() === property.city.toLowerCase()) return true;
    if (m.state && !m.city && !m.county && !m.zip && m.state.toUpperCase() === property.state.toUpperCase())
      return true;
    return false;
  });
}
