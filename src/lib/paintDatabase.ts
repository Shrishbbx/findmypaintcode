import paintDatabase from '@/data/paint-database.json';

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface PaintCodeRGB {
  highlight: RGBColor;
  base: RGBColor;
  shadow: RGBColor;
}

export interface PaintCodeHex {
  highlight: string;
  base: string;
  shadow: string;
}

export interface PaintCodeEntry {
  code: string;
  name: string;
  brand: string;
  type: string;
  gloss: string;
  rgb: PaintCodeRGB;
  hex: PaintCodeHex;
  purchaseLinks: {
    erapaints: string | null;
    amazon: string | null;
  };
  products: {
    basicKit: string | null;
    essentialKit: string | null;
    proKit: string | null;
    premiumKit: string | null;
  };
  price: string;
}

export interface PaintDatabase {
  brands: Record<string, { name: string; codes: string[] }>;
  paintCodes: PaintCodeEntry[];
  metadata: {
    totalCodes: number;
    lastUpdated: string;
    source: string;
  };
}

const db = paintDatabase as PaintDatabase;

/**
 * Search for paint codes by brand and code
 */
export function findPaintCode(brand: string, code: string): PaintCodeEntry | null {
  const normalizedBrand = brand.trim().toUpperCase();
  const normalizedCode = code.trim().toUpperCase();

  const result = db.paintCodes.find(
    (entry) =>
      entry.brand?.trim().toUpperCase() === normalizedBrand &&
      entry.code?.toUpperCase() === normalizedCode
  );

  return result || null;
}

/**
 * Search for paint codes by brand (returns all codes for that brand)
 */
export function findPaintCodesByBrand(brand: string): PaintCodeEntry[] {
  const normalizedBrand = brand.trim().toUpperCase();

  return db.paintCodes.filter(
    (entry) => entry.brand?.trim().toUpperCase() === normalizedBrand
  );
}

/**
 * Search for paint codes by color name (fuzzy search)
 */
export function searchByColorName(colorQuery: string): PaintCodeEntry[] {
  const query = colorQuery.toLowerCase().trim();

  return db.paintCodes.filter((entry) =>
    entry.name?.toLowerCase().includes(query)
  );
}

/**
 * Search for paint codes by hex color (approximate match)
 */
export function searchByHexColor(hexColor: string, tolerance = 30): PaintCodeEntry[] {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse target RGB
  const targetR = parseInt(hex.substring(0, 2), 16);
  const targetG = parseInt(hex.substring(2, 4), 16);
  const targetB = parseInt(hex.substring(4, 6), 16);

  // Find colors within tolerance (using base color)
  return db.paintCodes.filter((entry) => {
    const { r, g, b } = entry.rgb.base;

    const distance = Math.sqrt(
      Math.pow(r - targetR, 2) +
      Math.pow(g - targetG, 2) +
      Math.pow(b - targetB, 2)
    );

    return distance <= tolerance;
  });
}

/**
 * Get all unique brands
 */
export function getAllBrands(): string[] {
  return Object.keys(db.brands)
    .filter((brand) => brand && brand !== 'undefined')
    .sort();
}

/**
 * Get total paint code count
 */
export function getTotalPaintCodes(): number {
  return db.metadata.totalCodes;
}

/**
 * Get database metadata
 */
export function getDatabaseMetadata() {
  return db.metadata;
}

/**
 * Advanced search: Find paint codes by multiple criteria
 */
export function advancedSearch(criteria: {
  brand?: string;
  code?: string;
  colorName?: string;
  hexColor?: string;
  type?: string; // Metallic, Pearl, Solid
}): PaintCodeEntry[] {
  let results = db.paintCodes;

  if (criteria.brand) {
    const normalizedBrand = criteria.brand.trim().toUpperCase();
    results = results.filter(
      (entry) => entry.brand?.trim().toUpperCase() === normalizedBrand
    );
  }

  if (criteria.code) {
    const normalizedCode = criteria.code.trim().toUpperCase();
    results = results.filter(
      (entry) => entry.code?.toUpperCase() === normalizedCode
    );
  }

  if (criteria.colorName) {
    const query = criteria.colorName.toLowerCase();
    results = results.filter((entry) =>
      entry.name?.toLowerCase().includes(query)
    );
  }

  if (criteria.hexColor) {
    const colorMatches = searchByHexColor(criteria.hexColor);
    const colorMatchCodes = new Set(colorMatches.map((c) => c.code));
    results = results.filter((entry) => colorMatchCodes.has(entry.code));
  }

  if (criteria.type) {
    results = results.filter(
      (entry) => entry.type?.toLowerCase() === criteria.type?.toLowerCase()
    );
  }

  return results;
}

/**
 * Get similar colors based on RGB distance
 */
export function getSimilarColors(
  referenceColor: { r: number; g: number; b: number },
  limit = 10
): PaintCodeEntry[] {
  const { r: refR, g: refG, b: refB } = referenceColor;

  // Calculate distance for all colors (using base color)
  const withDistance = db.paintCodes.map((entry) => {
    const { r, g, b } = entry.rgb.base;
    const distance = Math.sqrt(
      Math.pow(r - refR, 2) +
      Math.pow(g - refG, 2) +
      Math.pow(b - refB, 2)
    );
    return { entry, distance };
  });

  // Sort by distance and return top N
  return withDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((item) => item.entry);
}

/**
 * Get swatch colors for rendering (highlight, base, shadow)
 * Returns the three RGB variants for creating realistic 3D color swatches
 */
export function getSwatchColors(brand: string, code: string): PaintCodeRGB | null {
  const paintCode = findPaintCode(brand, code);
  if (!paintCode) {
    return null;
  }
  return paintCode.rgb;
}

/**
 * Get swatch hex colors for rendering
 * Returns the three hex variants for creating realistic 3D color swatches
 */
export function getSwatchHexColors(brand: string, code: string): PaintCodeHex | null {
  const paintCode = findPaintCode(brand, code);
  if (!paintCode) {
    return null;
  }
  return paintCode.hex;
}
