import { paintCodeLocations, type PaintCodeLocation } from '@/data/paint-code-locations';

/**
 * Information about a vehicle brand
 */
export interface BrandInfo {
  name: string;
  normalized: string; // lowercase, no spaces for matching
  hasVinLocationData: boolean;
}

/**
 * Priority brands to display in the welcome stage
 * These are the most common brands users will search for
 */
const COMMON_BRANDS = [
  'TOYOTA',
  'HONDA',
  'FORD',
  'CHEVROLET',
  'NISSAN',
  'BMW',
  'MERCEDES',
  'VOLKSWAGEN',
  'HYUNDAI'
];

/**
 * Get all available brands from paint-code-locations.ts
 */
export function getAvailableBrands(): BrandInfo[] {
  return paintCodeLocations.map((location) => ({
    name: location.brand,
    normalized: location.brand.toLowerCase().replace(/[-\s]/g, ''),
    hasVinLocationData: true
  }));
}

/**
 * Get the common brands for display in welcome stage buttons
 * Returns top 9 priority brands that have VIN location data
 */
export function getCommonBrands(): string[] {
  const availableBrands = getAvailableBrands();
  const availableBrandNames = new Set(
    availableBrands.map((b) => b.name.toUpperCase())
  );

  // Filter common brands to only those available in our database
  const commonInDatabase = COMMON_BRANDS.filter((brand) =>
    availableBrandNames.has(brand.toUpperCase())
  );

  // If we have fewer than 9, fill with other available brands
  if (commonInDatabase.length < 9) {
    const additionalBrands = availableBrands
      .filter(
        (b) =>
          !COMMON_BRANDS.map((cb) => cb.toUpperCase()).includes(
            b.name.toUpperCase()
          )
      )
      .slice(0, 9 - commonInDatabase.length)
      .map((b) => b.name);

    return [...commonInDatabase, ...additionalBrands];
  }

  return commonInDatabase;
}

/**
 * Match a user input to a brand name (fuzzy matching)
 * Returns the matched brand name or null if not found
 */
export function matchBrandName(input: string): string | null {
  if (!input || !input.trim()) return null;

  const normalizedInput = input.toLowerCase().replace(/[-\s]/g, '');
  const brands = getAvailableBrands();

  // Try exact match first
  const exactMatch = brands.find((b) => b.normalized === normalizedInput);
  if (exactMatch) return exactMatch.name;

  // Try starts-with match
  const startsWithMatch = brands.find((b) => b.normalized.startsWith(normalizedInput));
  if (startsWithMatch) return startsWithMatch.name;

  // Try contains match
  const containsMatch = brands.find((b) => b.normalized.includes(normalizedInput));
  if (containsMatch) return containsMatch.name;

  return null;
}

/**
 * Get paint code location data for a specific brand
 */
export function getBrandLocationData(brand: string): PaintCodeLocation | null {
  const normalizedInput = brand.toUpperCase().trim();

  const match = paintCodeLocations.find(
    (location) => location.brand.toUpperCase() === normalizedInput
  );

  return match || null;
}

/**
 * Parse user input that might contain brand and model together
 * Example: "Toyota Fortuner" → { brand: "Toyota", model: "Fortuner" }
 */
export interface ParsedBrandModel {
  brand?: string;
  model?: string;
  confidence: number; // 0-1
}

export function parseBrandAndModel(input: string): ParsedBrandModel {
  if (!input || !input.trim()) {
    return { confidence: 0 };
  }

  const brands = getAvailableBrands();
  const words = input.trim().split(/\s+/);

  // Try to find a brand in the first 1-2 words
  for (let i = 1; i <= Math.min(2, words.length); i++) {
    const potentialBrand = words.slice(0, i).join(' ');
    const matchedBrand = matchBrandName(potentialBrand);

    if (matchedBrand) {
      const remainingWords = words.slice(i);
      const model = remainingWords.length > 0 ? remainingWords.join(' ') : undefined;

      return {
        brand: matchedBrand,
        model,
        confidence: model ? 0.9 : 0.8 // Higher confidence if model is also present
      };
    }
  }

  // No brand match found
  return { confidence: 0 };
}

/**
 * Get all brand names as a simple string array
 */
export function getAllBrandNames(): string[] {
  return getAvailableBrands().map((b) => b.name);
}
