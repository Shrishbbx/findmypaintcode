/**
 * Two-Tier Database Preparation
 *
 * TIER 1 (Priority): ERA Paints Product Catalog
 * TIER 2 (Fallback): Complete OEM Reference Database
 *
 * Search Strategy:
 * 1. Search Tier 1 first (purchasable products)
 * 2. If not found, search Tier 2 (reference only)
 * 3. Suggest similar products from Tier 1
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const DATA_DIR = path.join(__dirname, '..', 'ColorData');
const MARTIN_FILE = path.join(DATA_DIR, 'SHRISH_MODIFIED_ERA_Martin_UsageList.csv');
const VALSPAR_FILE = path.join(DATA_DIR, 'SHRISH MODIFIED_ERA_Valspar_UsageList.csv');
const TIER1_INPUT = path.join(DATA_DIR, 'merged-paint-database.json');
const TIER1_OUTPUT = path.join(DATA_DIR, 'tier1-products.json');
const TIER2_OUTPUT = path.join(DATA_DIR, 'tier2-reference.json');

console.log('🎨 Two-Tier Database Preparation\n');

// ============================================
// TIER 1: ERA Paints Product Catalog
// ============================================
console.log('📦 TIER 1: Processing ERA Paints Products...');

const tier1Products = JSON.parse(fs.readFileSync(TIER1_INPUT, 'utf-8'));

// Create searchable index for Tier 1
const tier1Index = {
  byIdentifier: new Map(),
  byPaintCode: new Map(),
  byBrand: new Map(),
  metadata: {
    totalProducts: tier1Products.length,
    brands: new Set(),
    lastUpdated: new Date().toISOString()
  }
};

tier1Products.forEach(product => {
  // Index by identifier (exact match)
  tier1Index.byIdentifier.set(product.identifier.toLowerCase(), product);

  // Index by paint code (for quick lookup)
  const key = `${product.brand.toLowerCase()}:${product.paintCode.toLowerCase()}`;
  tier1Index.byPaintCode.set(key, product);

  // Index by brand (for brand-wide searches)
  if (!tier1Index.byBrand.has(product.brand)) {
    tier1Index.byBrand.set(product.brand, []);
  }
  tier1Index.byBrand.get(product.brand).push(product);

  tier1Index.metadata.brands.add(product.brand);
});

// Convert Sets to Arrays for JSON serialization
tier1Index.metadata.brands = Array.from(tier1Index.metadata.brands).sort();

// Save Tier 1 (compact format for fast loading)
fs.writeFileSync(TIER1_OUTPUT, JSON.stringify(tier1Products, null, 2));

console.log(`✓ Tier 1: ${tier1Products.length.toLocaleString()} products`);
console.log(`✓ Brands: ${tier1Index.metadata.brands.length}`);

// ============================================
// TIER 2: OEM Reference Database
// ============================================
console.log('\n📚 TIER 2: Processing OEM Reference Data...');

const martinData = parse(fs.readFileSync(MARTIN_FILE, 'utf-8'), {
  columns: true,
  skip_empty_lines: true
});

const valsparData = parse(fs.readFileSync(VALSPAR_FILE, 'utf-8'), {
  columns: true,
  skip_empty_lines: true
});

console.log(`✓ Martin: ${martinData.length.toLocaleString()} records`);
console.log(`✓ Valspar: ${valsparData.length.toLocaleString()} records`);

// Build Tier 2 reference index (grouped by identifier)
const tier2Reference = new Map();

function addToTier2(row) {
  const identifier = row['Identifier (Make + Color Code + Color Name)'];
  if (!identifier || identifier.trim() === '') return;

  // Skip if already in Tier 1 (products we sell)
  if (tier1Index.byIdentifier.has(identifier.toLowerCase())) return;

  if (!tier2Reference.has(identifier)) {
    // Parse identifier
    const parts = identifier.split(' - ');
    if (parts.length !== 3) return;

    const [brand, paintCode, colorName] = parts.map(p => p.trim());

    tier2Reference.set(identifier, {
      identifier,
      brand,
      paintCode,
      colorName,
      models: new Set(),
      years: new Set(),
      parts: new Set(),
      regions: new Set(),
      inStock: false, // Not in our catalog
      tier: 2
    });
  }

  const ref = tier2Reference.get(identifier);

  // Add model
  const model = row.MODEL_NAME?.trim();
  if (model && model !== '' && model !== 'Non-specific Model') {
    ref.models.add(model);
  }

  // Add years
  const years = row.ALL_YEARS_USED?.trim();
  if (years && years !== '') {
    years.split(';').forEach(year => {
      const y = year.trim();
      if (y) ref.years.add(y);
    });
  }

  // Add parts
  const parts = row.ALL_VEHICLE_PARTS?.trim();
  if (parts && parts !== '') {
    ref.parts.add(parts);
  }

  // Add region (Valspar only)
  const region = row.REGION_NAME?.trim();
  if (region && region !== '') {
    ref.regions.add(region);
  }
}

martinData.forEach(addToTier2);
valsparData.forEach(addToTier2);

// Convert to array and serialize Sets
const tier2Array = Array.from(tier2Reference.values()).map(ref => ({
  identifier: ref.identifier,
  brand: ref.brand,
  paintCode: ref.paintCode,
  colorName: ref.colorName,
  models: Array.from(ref.models).sort(),
  years: Array.from(ref.years).sort(),
  parts: Array.from(ref.parts),
  regions: Array.from(ref.regions),
  inStock: false,
  tier: 2,
  message: "We don't currently stock this color. Contact us if you'd like to request it!"
}));

// Sort by brand, then paint code
tier2Array.sort((a, b) => {
  if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
  return a.paintCode.localeCompare(b.paintCode);
});

fs.writeFileSync(TIER2_OUTPUT, JSON.stringify(tier2Array, null, 2));

console.log(`✓ Tier 2: ${tier2Array.length.toLocaleString()} reference paint codes`);

// ============================================
// Summary Statistics
// ============================================
console.log('\n📊 Database Summary:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`   TIER 1 (In Stock):`);
console.log(`   └─ Products:     ${tier1Products.length.toLocaleString()}`);
console.log(`   └─ Brands:       ${tier1Index.metadata.brands.length}`);
console.log(`   └─ Searchable:   ✅ With Purchase Links`);
console.log('');
console.log(`   TIER 2 (Reference Only):`);
console.log(`   └─ Paint Codes:  ${tier2Array.length.toLocaleString()}`);
console.log(`   └─ Purpose:      OEM Information Only`);
console.log(`   └─ Searchable:   ✅ No Purchase Links`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`   TOTAL Coverage:  ${(tier1Products.length + tier2Array.length).toLocaleString()} paint codes`);
console.log('');

// Brand overlap analysis
const tier2Brands = new Set(tier2Array.map(p => p.brand));
const tier1Brands = new Set(tier1Index.metadata.brands);
const commonBrands = Array.from(tier1Brands).filter(b => tier2Brands.has(b));

console.log(`   Brand Coverage:`);
console.log(`   └─ Tier 1 only:  ${tier1Brands.size - commonBrands.length}`);
console.log(`   └─ Both tiers:   ${commonBrands.length}`);
console.log(`   └─ Tier 2 only:  ${tier2Brands.size - commonBrands.length}`);

console.log('\n💾 Output Files:');
console.log(`   ${TIER1_OUTPUT}`);
console.log(`   ${TIER2_OUTPUT}`);

console.log('\n🚀 Next Steps:');
console.log('   1. Upload both files to Supabase (separate tables)');
console.log('   2. Create API endpoint with two-tier search logic');
console.log('   3. Update chatbot to prioritize Tier 1 results');
console.log('   4. Add "Request this color" feature for Tier 2 results');
