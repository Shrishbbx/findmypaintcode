import { matchBrandName, getAllBrandNames } from './brand-helpers';

/**
 * Result of parsing user input for vehicle information
 */
export interface ParsedInput {
  brand?: string;
  model?: string;
  year?: number;
  paintCode?: string;
  confidence: number; // 0-1, how confident we are about the parsing
}

/**
 * Extract a 4-digit year from text (1900-2099)
 */
function extractYear(text: string): number | null {
  // Match 4-digit years in reasonable automotive range
  const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/);

  if (yearMatch) {
    const year = parseInt(yearMatch[1]);

    // Validate year is in reasonable range for cars
    if (year >= 1900 && year <= 2099) {
      return year;
    }
  }

  return null;
}

/**
 * Extract potential paint code from text
 * Paint codes are typically 3-8 alphanumeric characters
 */
function extractPaintCode(text: string): string | null {
  // Match common paint code patterns
  // Examples: "040", "NH-883P", "B537M", "C/TR", "PGF"
  const codePatterns = [
    /\b([A-Z0-9]{3,8})\b/i, // Simple alphanumeric codes
    /\b([A-Z]+[-\/][A-Z0-9]+)\b/i, // Codes with dashes or slashes
  ];

  for (const pattern of codePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Parse vehicle input text to extract brand, model, year, and paint code
 * Handles various formats:
 * - "Toyota Fortuner"
 * - "2015 Toyota Camry"
 * - "Honda Civic 2020"
 * - "Ford F-150"
 * - "Toyota Camry Silver 1A2"
 */
export function parseVehicleInput(
  text: string,
  availableBrands?: string[]
): ParsedInput {
  if (!text || !text.trim()) {
    return { confidence: 0 };
  }

  const brands = availableBrands || getAllBrandNames();
  const trimmedText = text.trim();

  let brand: string | undefined;
  let model: string | undefined;
  let year: number | undefined;
  let paintCode: string | undefined;
  let confidence = 0;

  // Extract year first (so we can remove it from further processing)
  year = extractYear(trimmedText) || undefined;
  let textWithoutYear = trimmedText;

  if (year) {
    // Remove year from text
    textWithoutYear = trimmedText.replace(year.toString(), '').trim();
    confidence += 0.2; // Boost confidence for year detection
  }

  // Try to match brand name at the start of the text
  const words = textWithoutYear.split(/\s+/);

  // Try 1-word and 2-word brand names (e.g., "Mercedes-Benz", "Land Rover")
  for (let i = 1; i <= Math.min(2, words.length); i++) {
    const potentialBrand = words.slice(0, i).join(' ');
    const matchedBrand = matchBrandName(potentialBrand);

    if (matchedBrand) {
      brand = matchedBrand;
      confidence += 0.4; // High confidence for brand match

      // Everything after the brand is potentially the model
      const remainingWords = words.slice(i);

      if (remainingWords.length > 0) {
        model = remainingWords.join(' ');
        confidence += 0.3; // Additional confidence for model

        // Check if model contains a paint code
        paintCode = extractPaintCode(model) || undefined;

        if (paintCode) {
          // Remove paint code from model
          model = model.replace(paintCode, '').trim();
          confidence += 0.1;
        }
      }

      break; // Found brand, no need to continue
    }
  }

  // If no brand found but we have a year, try to extract model
  if (!brand && year && words.length > 0) {
    model = words.join(' ');
    confidence = 0.3; // Lower confidence without brand
  }

  // If no brand and no year, treat the whole text as potential model or brand
  if (!brand && !year && words.length > 0) {
    // Check if it could be a brand name
    const potentialBrand = matchBrandName(words[0]);

    if (potentialBrand) {
      brand = potentialBrand;
      model = words.slice(1).join(' ') || undefined;
      confidence = model ? 0.7 : 0.5;
    } else {
      // Assume it's a model if we don't recognize a brand
      model = trimmedText;
      confidence = 0.2;
    }
  }

  return {
    brand,
    model: model && model.trim() !== '' ? model.trim() : undefined,
    year,
    paintCode,
    confidence: Math.min(confidence, 1.0)
  };
}

/**
 * Parse free-form paint code input
 * Extracts potential paint codes from user text
 */
export function parsePaintCodeInput(text: string): string | null {
  if (!text || !text.trim()) return null;

  // Try to extract paint code
  return extractPaintCode(text);
}

/**
 * Validate if a string looks like a paint code
 */
export function isPaintCode(text: string): boolean {
  if (!text || text.length < 2 || text.length > 12) return false;

  // Paint codes typically contain alphanumeric characters and possibly dashes or slashes
  const paintCodePattern = /^[A-Z0-9\-\/]+$/i;
  return paintCodePattern.test(text);
}

/**
 * Parse model and year from text (when brand is already known)
 * Example: "Camry 2015" or "2015 Camry" or "Camry"
 */
export function parseModelAndYear(text: string): { model?: string; year?: number } {
  if (!text || !text.trim()) {
    return {};
  }

  const year = extractYear(text) || undefined;
  let model: string | undefined;

  if (year) {
    // Remove year from text to get model
    model = text.replace(year.toString(), '').trim();
  } else {
    // No year found, entire text is model
    model = text.trim();
  }

  return {
    model: model && model !== '' ? model : undefined,
    year
  };
}
