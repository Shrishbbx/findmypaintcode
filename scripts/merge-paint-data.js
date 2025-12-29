/**
 * Paint Database Merger
 *
 * Combines three data sources into a unified paint code database:
 * 1. Colordata1.csv - ERA Paints products (RGB, ASINs, pricing)
 * 2. Martin UsageList - Vehicle model/year mappings
 * 3. Valspar UsageList - Vehicle model/year mappings
 *
 * JOIN KEY: Identifier (Make + Color Code + Color Name)
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// File paths
const DATA_DIR = path.join(__dirname, '..', 'ColorData');
const COLORDATA_FILE = path.join(DATA_DIR, 'Colordata1.csv');
const MARTIN_FILE = path.join(DATA_DIR, 'SHRISH_MODIFIED_ERA_Martin_UsageList.csv');
const VALSPAR_FILE = path.join(DATA_DIR, 'SHRISH MODIFIED_ERA_Valspar_UsageList.csv');
const OUTPUT_FILE = path.join(DATA_DIR, 'merged-paint-database.json');

console.log('🎨 Paint Database Merger\n');
console.log('Reading CSV files...');

// Read and parse CSV files
const colordata = parse(fs.readFileSync(COLORDATA_FILE, 'utf-8'), {
  columns: true,
  skip_empty_lines: true
});

const martinData = parse(fs.readFileSync(MARTIN_FILE, 'utf-8'), {
  columns: true,
  skip_empty_lines: true
});

const valsparData = parse(fs.readFileSync(VALSPAR_FILE, 'utf-8'), {
  columns: true,
  skip_empty_lines: true
});

console.log(`✓ Colordata1: ${colordata.length.toLocaleString()} products`);
console.log(`✓ Martin: ${martinData.length.toLocaleString()} vehicle mappings`);
console.log(`✓ Valspar: ${valsparData.length.toLocaleString()} vehicle mappings`);
console.log('\nMerging data...\n');

// Combine Martin and Valspar into one vehicle mapping index
const vehicleMappings = new Map();

function addVehicleMapping(row) {
  const identifier = row['Identifier (Make + Color Code + Color Name)'];
  if (!identifier || identifier.trim() === '') return;

  if (!vehicleMappings.has(identifier)) {
    vehicleMappings.set(identifier, {
      models: new Set(),
      yearRanges: {},
      parts: new Set(),
      regions: new Set()
    });
  }

  const mapping = vehicleMappings.get(identifier);

  // Add model
  const model = row.MODEL_NAME?.trim();
  if (model && model !== '') {
    mapping.models.add(model);
  }

  // Add years
  const years = row.ALL_YEARS_USED?.trim();
  if (years && years !== '' && model && model !== '') {
    mapping.yearRanges[model] = years;
  }

  // Add parts
  const parts = row.ALL_VEHICLE_PARTS?.trim();
  if (parts && parts !== '') {
    mapping.parts.add(parts);
  }

  // Add region (Valspar only)
  const region = row.REGION_NAME?.trim();
  if (region && region !== '') {
    mapping.regions.add(region);
  }
}

martinData.forEach(addVehicleMapping);
valsparData.forEach(addVehicleMapping);

console.log(`✓ Created mappings for ${vehicleMappings.size.toLocaleString()} unique paint identifiers\n`);

// Merge Colordata1 with vehicle mappings
const mergedDatabase = [];
let matchedCount = 0;
let unmatchedCount = 0;

colordata.forEach((product) => {
  // The identifier column in Colordata1
  const identifier = product['Identifier (Make + Color Code + Color Name)'] ||
                     product['Name (Make/Brand + Color Code + Color Name)'];

  if (!identifier || identifier.trim() === '') {
    console.warn(`⚠ Skipping product with no identifier`);
    return;
  }

  // Parse identifier to extract brand, code, name
  const parts = identifier.split(' - ');
  if (parts.length !== 3) {
    console.warn(`⚠ Invalid identifier format: ${identifier}`);
    return;
  }

  const [brand, paintCode, colorName] = parts.map(p => p.trim());

  // Get vehicle mappings if they exist
  const vehicleData = vehicleMappings.get(identifier);

  if (vehicleData) {
    matchedCount++;
  } else {
    unmatchedCount++;
  }

  // Parse RGB values
  const rgb1 = [
    parseInt(product.Red1 || 0),
    parseInt(product.Green1 || 0),
    parseInt(product.Blue1 || 0)
  ];
  const rgb2 = [
    parseInt(product.Red2 || 0),
    parseInt(product.Green2 || 0),
    parseInt(product.Blue2 || 0)
  ];
  const rgb3 = [
    parseInt(product.Red3 || 0),
    parseInt(product.Green3 || 0),
    parseInt(product.Blue3 || 0)
  ];

  // Build merged record
  const record = {
    // Identification
    identifier: identifier,
    brand: brand,
    paintCode: paintCode,
    colorName: colorName,

    // Vehicle compatibility (from Martin/Valspar)
    models: vehicleData ? Array.from(vehicleData.models).filter(m => m !== 'Non-specific Model') : [],
    yearRanges: vehicleData ? vehicleData.yearRanges : {},
    applicableParts: vehicleData ? Array.from(vehicleData.parts) : [],
    regions: vehicleData ? Array.from(vehicleData.regions) : [],

    // Visual properties (from Colordata1)
    rgb: {
      base: rgb1,
      midtone: rgb2,
      shadow: rgb3
    },
    hex: rgbToHex(rgb1[0], rgb1[1], rgb1[2]),
    paintType: product.Type || 'Unknown',
    gloss: product.Gloss || 'Unknown',

    // Product information (from Colordata1)
    productTitle: product['PRODUCT TITLE'] || '',
    msrp: parseFloat(product.MSRP?.replace('$', '') || '0'),

    // Purchase links (from Colordata1)
    asins: {
      proKit: product['Asin Pro Kit [Touchup Jar]'] || null,
      essentialKit: product['Asin Essential Kit [Touchup Jar]'] || null,
      premiumKit: product['Asin Premium Kit [Touchup Jar]'] || null,
      basicKit: product['ASIN Basic Kit [Touchup Jar]'] || null
    },

    // Metadata
    hasVehicleData: !!vehicleData,
    lastUpdated: new Date().toISOString()
  };

  // Filter out #N/A ASINs
  Object.keys(record.asins).forEach(key => {
    if (record.asins[key] === '#N/A' || record.asins[key] === '') {
      record.asins[key] = null;
    }
  });

  mergedDatabase.push(record);
});

// Helper function to convert RGB to Hex
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

// Sort by brand, then paint code
mergedDatabase.sort((a, b) => {
  if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
  return a.paintCode.localeCompare(b.paintCode);
});

// Write output
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mergedDatabase, null, 2));

// Statistics
console.log('✅ Merge Complete!\n');
console.log('📊 Statistics:');
console.log(`   Total products: ${mergedDatabase.length.toLocaleString()}`);
console.log(`   Matched with vehicle data: ${matchedCount.toLocaleString()} (${Math.round(matchedCount/mergedDatabase.length*100)}%)`);
console.log(`   No vehicle data: ${unmatchedCount.toLocaleString()} (${Math.round(unmatchedCount/mergedDatabase.length*100)}%)`);

// Brand breakdown
const brandCounts = {};
mergedDatabase.forEach(record => {
  brandCounts[record.brand] = (brandCounts[record.brand] || 0) + 1;
});

console.log(`\n   Brands: ${Object.keys(brandCounts).length}`);
Object.entries(brandCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([brand, count]) => {
    console.log(`     ${brand}: ${count} colors`);
  });

console.log(`\n💾 Output saved to: ${OUTPUT_FILE}`);
console.log('\n🚀 Next steps:');
console.log('   1. Review merged-paint-database.json');
console.log('   2. Import to Supabase database');
console.log('   3. Create API endpoints for secure access');
