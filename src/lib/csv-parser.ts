import fs from 'fs';
import path from 'path';

/**
 * Represents a paint code entry from Colordata1.csv
 */
export interface PaintCodeData {
  brand: string;
  code: string;
  colorName: string;
  asinProKit?: string;
  asinEssentialKit?: string;
  asinPremiumKit?: string;
  asinBasicKit?: string;
  productTitle?: string;
  price?: string;
  rgbHighlight: [number, number, number];
  rgbBase: [number, number, number];
  rgbShadow: [number, number, number];
  type?: 'Metallic' | 'Pearl' | 'Solid' | string;
  gloss?: 'High' | 'Medium' | 'Low' | string;
}

// In-memory cache for parsed CSV data
let paintCodeDatabase: PaintCodeData[] | null = null;

/**
 * Parse a single row from Colordata1.csv
 */
function parseRow(row: string): PaintCodeData | null {
  // Split by comma, handling quoted values
  const columns = row.split(',');

  if (columns.length < 20) {
    return null; // Invalid row
  }

  // Parse "BRAND - CODE - COLOR NAME" from column 0
  const nameField = columns[0];
  const nameParts = nameField.split(' - ');

  if (nameParts.length < 3) {
    return null; // Invalid format
  }

  const brand = nameParts[0].trim();
  const code = nameParts[1].trim();
  const colorName = nameParts.slice(2).join(' - ').trim(); // Handle color names with dashes

  return {
    brand,
    code,
    colorName,
    asinProKit: columns[1] || undefined,
    asinEssentialKit: columns[2] || undefined,
    asinPremiumKit: columns[3] || undefined,
    asinBasicKit: columns[4] || undefined,
    productTitle: columns[5] || undefined,
    price: columns[6] || undefined,
    rgbHighlight: [
      parseInt(columns[9]) || 0,
      parseInt(columns[10]) || 0,
      parseInt(columns[11]) || 0
    ],
    rgbBase: [
      parseInt(columns[12]) || 0,
      parseInt(columns[13]) || 0,
      parseInt(columns[14]) || 0
    ],
    rgbShadow: [
      parseInt(columns[15]) || 0,
      parseInt(columns[16]) || 0,
      parseInt(columns[17]) || 0
    ],
    type: columns[18] || undefined,
    gloss: columns[19] || undefined
  };
}

/**
 * Load and parse the entire Colordata1.csv file
 * Results are cached in memory for performance
 */
export async function loadPaintCodeDatabase(): Promise<PaintCodeData[]> {
  // Return cached data if available
  if (paintCodeDatabase) {
    return paintCodeDatabase;
  }

  const csvPath = path.join(process.cwd(), 'ColorData', 'Colordata1.csv');

  try {
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n');

    // Skip header row (index 0)
    const dataLines = lines.slice(1);

    const parsedData: PaintCodeData[] = [];

    for (const line of dataLines) {
      if (!line.trim()) continue; // Skip empty lines

      const parsed = parseRow(line);
      if (parsed) {
        parsedData.push(parsed);
      }
    }

    // Cache the parsed data
    paintCodeDatabase = parsedData;

    console.log(`Loaded ${parsedData.length} paint codes from Colordata1.csv`);
    return parsedData;
  } catch (error) {
    console.error('Error loading paint code database:', error);
    return [];
  }
}

/**
 * Normalize brand name for case-insensitive matching
 */
export function normalizeBrandName(brand: string): string {
  return brand.toUpperCase().trim();
}

/**
 * Search for a paint code by brand and code
 * Returns the first matching entry or null if not found
 */
export async function searchByBrandAndCode(
  brand: string,
  code: string
): Promise<PaintCodeData | null> {
  const database = await loadPaintCodeDatabase();
  const normalizedBrand = normalizeBrandName(brand);
  const normalizedCode = code.toUpperCase().trim();

  const result = database.find(
    (entry) =>
      normalizeBrandName(entry.brand) === normalizedBrand &&
      entry.code.toUpperCase().trim() === normalizedCode
  );

  return result || null;
}

/**
 * Fuzzy search for paint codes by color name
 * Returns array of matching entries
 */
export async function fuzzySearchByColor(
  brand: string,
  colorName: string
): Promise<PaintCodeData[]> {
  const database = await loadPaintCodeDatabase();
  const normalizedBrand = normalizeBrandName(brand);
  const searchTerm = colorName.toLowerCase().trim();

  return database.filter(
    (entry) =>
      normalizeBrandName(entry.brand) === normalizedBrand &&
      entry.colorName.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get all paint codes for a specific brand
 */
export async function getPaintCodesByBrand(brand: string): Promise<PaintCodeData[]> {
  const database = await loadPaintCodeDatabase();
  const normalizedBrand = normalizeBrandName(brand);

  return database.filter(
    (entry) => normalizeBrandName(entry.brand) === normalizedBrand
  );
}

/**
 * Clear the cache (useful for testing or if CSV is updated)
 */
export function clearCache(): void {
  paintCodeDatabase = null;
}
