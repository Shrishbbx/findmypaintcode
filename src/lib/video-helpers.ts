/**
 * Video helper utilities for loading and querying paint code instructional videos
 */

export interface PaintCodeVideo {
  brand: string;
  title: string;
  url: string;
  embedUrl: string;
}

// In-memory cache for video data
let videoDatabase: PaintCodeVideo[] | null = null;

/**
 * Convert YouTube watch URL to embed URL
 * Example: https://www.youtube.com/watch?v=6ac1ARi5NFw -> https://www.youtube.com/embed/6ac1ARi5NFw
 */
export function getEmbedUrl(watchUrl: string): string {
  try {
    const url = new URL(watchUrl);
    const videoId = url.searchParams.get('v');
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return watchUrl;
  } catch {
    return watchUrl;
  }
}

/**
 * Parse CSV data and convert to PaintCodeVideo objects
 */
function parseVideoCSV(csvContent: string): PaintCodeVideo[] {
  const lines = csvContent.trim().split('\n');
  const videos: PaintCodeVideo[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line (Brand,Video Title,YouTube URL)
    const parts = line.split(',');
    if (parts.length >= 3) {
      const brand = parts[0].trim();
      const title = parts[1].trim();
      const url = parts[2].trim();

      videos.push({
        brand,
        title,
        url,
        embedUrl: getEmbedUrl(url),
      });
    }
  }

  return videos;
}

/**
 * Load video database from CSV file (server-side only)
 * This function uses Node.js fs module and should only be called server-side
 */
export async function loadVideoDatabase(): Promise<PaintCodeVideo[]> {
  // Return cached data if available
  if (videoDatabase) {
    return videoDatabase;
  }

  // This will only work server-side
  if (typeof window !== 'undefined') {
    console.error('[VIDEO] loadVideoDatabase should only be called server-side');
    return [];
  }

  try {
    const fs = await import('fs');
    const path = await import('path');
    const csvPath = path.join(process.cwd(), 'paint-code-videos.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    videoDatabase = parseVideoCSV(csvContent);

    console.log(`[VIDEO] Loaded ${videoDatabase.length} instructional videos`);
    return videoDatabase;
  } catch (error) {
    console.error('[VIDEO] Error loading video database:', error);
    return [];
  }
}

/**
 * Normalize brand name for matching (case-insensitive, removes spaces/hyphens)
 */
export function normalizeBrand(brand: string): string {
  return brand
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/&/g, 'AND');
}

/**
 * Find video by brand name (case-insensitive)
 * Returns null if no video found
 */
export function getVideoByBrand(
  videos: PaintCodeVideo[],
  brand: string
): PaintCodeVideo | null {
  const normalizedSearch = normalizeBrand(brand);

  // Try exact match first
  const exactMatch = videos.find(
    (v) => normalizeBrand(v.brand) === normalizedSearch
  );

  if (exactMatch) return exactMatch;

  // Try partial match (e.g., "MINI" matches "MINI COOPER")
  const partialMatch = videos.find((v) =>
    normalizeBrand(v.brand).includes(normalizedSearch)
  );

  if (partialMatch) return partialMatch;

  // Try reverse partial match (e.g., "LAND ROVER" matches "LANDROVER")
  const reverseMatch = videos.find((v) =>
    normalizedSearch.includes(normalizeBrand(v.brand))
  );

  return reverseMatch || null;
}

/**
 * Clear the cache (useful for testing or if CSV is updated)
 */
export function clearVideoCache(): void {
  videoDatabase = null;
}
