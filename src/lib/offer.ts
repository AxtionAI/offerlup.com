/**
 * Offer pricing model.
 *
 * The guaranteed cash offer sent to a seller is the LOWER of:
 *   1) ARV minus the estimated rehab cost (the "flip math" ceiling), and
 *   2) 80% of the Zillow Estimate (a 20% discount, used as a market sanity cap).
 *
 * This fixed number is what the seller is guaranteed to receive if they accept —
 * it never moves once an auction starts. Investors then compete in a blind,
 * ascending auction for the right to acquire the contract. The platform charges
 * the winning investor a 6% fee on top of their winning bid; none of that
 * competition changes what the seller is paid, so the seller has no incentive
 * to negotiate down and investors get full transparency into the deal economics.
 */
export function calculateOfferPrice(afterRepairValue: number, rehabCost: number, zillowEstimate: number) {
  const flipMathOffer = afterRepairValue - rehabCost;
  const zillowDiscountOffer = zillowEstimate * 0.8;
  const offerPrice = Math.max(0, Math.min(flipMathOffer, zillowDiscountOffer));

  return {
    flipMathOffer,
    zillowDiscountOffer,
    offerPrice: Math.round(offerPrice),
    cappedBy: flipMathOffer <= zillowDiscountOffer ? ("ARV_MINUS_REHAB" as const) : ("ZILLOW_DISCOUNT" as const),
  };
}

/**
 * A rough, non-binding offer range shown to the seller on the submission
 * wizard — not the real offer. We only collect one number at this stage (the
 * seller's own sense of current market value), not a true ARV, so we can't
 * run the real ARV-minus-rehab side of calculateOfferPrice here.
 *
 * Instead we anchor the range at the same 80%-of-market ceiling the real
 * formula uses, and pull the low end down by the condition tier's worst-case
 * rehab percentage — rougher condition means more uncertainty, so a wider
 * discount off that ceiling. (Feeding the same number in as both "ARV" and
 * "Zillow estimate" to the real formula would make the 80% cap dominate
 * regardless of condition and collapse the range to a single point, which is
 * what this avoids.)
 */
export function estimateOfferRange(zillowEstimate: number, maxRehabPct: number) {
  const high = Math.max(0, zillowEstimate * 0.8);
  const low = Math.max(0, high * (1 - maxRehabPct));
  return {
    low: Math.round(low),
    high: Math.round(high),
  };
}

export const PLATFORM_FEE_RATE = 0.06;

export function calculateInvestorCost(winningBid: number) {
  const platformFee = Math.round(winningBid * PLATFORM_FEE_RATE);
  return {
    winningBid,
    platformFee,
    totalDue: winningBid + platformFee,
  };
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
