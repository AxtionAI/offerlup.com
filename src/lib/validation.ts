import { z } from "zod";

/**
 * z.coerce.number().optional() still fails on an empty string ("" coerces to
 * 0, not undefined), which is exactly what a blank optional number input
 * sends. This treats "", null, and undefined as "not provided".
 */
function optionalNumber() {
  // The optional() must wrap the inner number schema (not the preprocess
  // itself) so that the undefined produced by the transform is what gets
  // short-circuited, rather than fed into z.coerce.number() as NaN.
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().optional()
  );
}

export const propertyTypeOptions = [
  { value: "SINGLE_FAMILY", label: "Single Family" },
  { value: "MULTI_FAMILY", label: "Multi-Family (2-4 units)" },
  { value: "CONDO", label: "Condo" },
  { value: "TOWNHOME", label: "Townhome" },
  { value: "LAND", label: "Vacant Land" },
  { value: "MOBILE_HOME", label: "Mobile / Manufactured Home" },
] as const;

export const conditionOptions = [
  { value: "NEEDS_FULL_REHAB", label: "Needs full rehab / tear-down" },
  { value: "NEEDS_MODERATE_WORK", label: "Needs moderate repairs" },
  { value: "LIGHT_COSMETIC", label: "Light cosmetic updates only" },
  { value: "MOVE_IN_READY", label: "Move-in ready" },
] as const;

/**
 * Richer presentation metadata for the visual condition picker, plus the
 * rough rehab-cost-as-%-of-ARV band used to show sellers a provisional offer
 * range before our team enters real numbers. Bands are deliberately wide —
 * this is a "realistic starting range" preview, not a written offer.
 */
export const conditionTiers = [
  {
    value: "NEEDS_FULL_REHAB",
    title: "Fixer-Upper",
    description: "Major renovation or full gut needed",
    minRehabPct: 0.15,
    maxRehabPct: 0.25,
  },
  {
    value: "NEEDS_MODERATE_WORK",
    title: "Dated",
    description: "Functional, but hasn't been updated recently",
    minRehabPct: 0.08,
    maxRehabPct: 0.15,
  },
  {
    value: "LIGHT_COSMETIC",
    title: "Standard",
    description: "Just needs paint and small fixes",
    minRehabPct: 0.03,
    maxRehabPct: 0.08,
  },
  {
    value: "MOVE_IN_READY",
    title: "Move-In Ready",
    description: "Updated and ready for a buyer today",
    minRehabPct: 0,
    maxRehabPct: 0.03,
  },
] as const;

export const challengeOptions = [
  { value: "REPAIRS_NEEDED", label: "Repairs needed" },
  { value: "INHERITED_PROPERTY", label: "Inherited property" },
  { value: "BEHIND_ON_PAYMENTS", label: "Behind on payments" },
  { value: "LIENS_CODE_ISSUES", label: "Liens / code issues" },
  { value: "TENANT_ISSUE", label: "Tenant issue" },
  { value: "LIFE_TRANSITION", label: "Life transition" },
] as const;

/**
 * Amenity tags sellers can select on their property and investors can prefer
 * in their Smart Buy Box (as a soft match-score bonus, not a hard filter —
 * see scoreMatch in matching.ts). Grouped for a friendlier picker UI.
 */
export const featureOptionGroups = [
  {
    group: "Comfort",
    options: [
      { value: "CENTRAL_AC", label: "Central A/C" },
      { value: "FIREPLACE", label: "Fireplace" },
      { value: "BASEMENT", label: "Basement" },
      { value: "SOLAR_PANELS", label: "Solar panels" },
    ],
  },
  {
    group: "Updates",
    options: [
      { value: "UPDATED_KITCHEN", label: "Updated kitchen" },
      { value: "UPDATED_BATHROOMS", label: "Updated bathrooms" },
      { value: "NEW_ROOF", label: "New roof" },
      { value: "NEW_FLOORING", label: "New flooring" },
    ],
  },
  {
    group: "Lot & Parking",
    options: [
      { value: "FENCED_YARD", label: "Fenced yard" },
      { value: "RV_BOAT_PARKING", label: "RV / boat parking" },
      { value: "CORNER_LOT", label: "Corner lot" },
      { value: "WATERFRONT", label: "Waterfront" },
    ],
  },
  {
    group: "Other",
    options: [
      { value: "MOTHER_IN_LAW_SUITE", label: "In-law suite / ADU" },
      { value: "GATED_COMMUNITY", label: "Gated community" },
    ],
  },
] as const;

export const featureOptions: { value: string; label: string }[] = featureOptionGroups.flatMap((g) => [...g.options]);

export const sellerSubmissionSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),

  addressLine1: z.string().min(3, "Street address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required").max(2, "Use a 2-letter state code"),
  zip: z.string().min(5, "Enter a valid ZIP code"),
  county: z.string().optional(),

  propertyType: z.enum([
    "SINGLE_FAMILY",
    "MULTI_FAMILY",
    "CONDO",
    "TOWNHOME",
    "LAND",
    "MOBILE_HOME",
  ]),
  condition: z.enum([
    "NEEDS_FULL_REHAB",
    "NEEDS_MODERATE_WORK",
    "LIGHT_COSMETIC",
    "MOVE_IN_READY",
  ]),
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().min(0).max(20),
  squareFeet: z.coerce.number().int().min(100).max(50000),
  yearBuilt: optionalNumber(),
  lotSizeSqft: optionalNumber(),
  stories: optionalNumber(),
  garageSpaces: optionalNumber(),
  hasPool: z.boolean().optional().default(false),
  hasHoa: z.boolean().optional().default(false),
  hoaFeeMonthly: optionalNumber(),
  features: z.array(z.string()).optional().default([]),

  zillowEstimate: z.coerce.number().min(1, "Enter an estimated market value"),

  occupancy: z.string().optional(),
  challenges: z.array(z.string()).optional().default([]),
  reasonForSelling: z.string().optional(),
  timelineToSell: z.string().optional(),
  askingPrice: optionalNumber(),
});

export type SellerSubmissionInput = z.infer<typeof sellerSubmissionSchema>;

export const investorSignupSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  companyName: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const buyBoxSchema = z.object({
  name: z.string().min(2),
  propertyTypes: z.array(z.string()).min(1, "Pick at least one property type"),
  conditions: z.array(z.string()).min(1, "Pick at least one condition"),
  markets: z
    .array(
      z.object({
        label: z.string().min(1),
        city: z.string().optional(),
        county: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
      })
    )
    .min(1, "Add at least one target market"),
  minBedrooms: optionalNumber(),
  minBathrooms: optionalNumber(),
  minSquareFeet: optionalNumber(),
  maxSquareFeet: optionalNumber(),
  minPrice: optionalNumber(),
  maxPrice: optionalNumber(),
  minYearBuilt: optionalNumber(),
  minGarageSpaces: optionalNumber(),
  requiresPool: z.boolean().optional().default(false),
  desiredFeatures: z.array(z.string()).optional().default([]),
});

export const proofOfFundsSchema = z.object({
  fundsAmount: z.coerce.number().min(1, "Enter the amount of verifiable funds"),
  sourceType: z.string().min(2, "Select a funding source"),
});

export const bidSchema = z.object({
  propertyId: z.string(),
  amount: z.coerce.number().min(1),
});
