const fs = require('fs');
const path = require('path');

/**
 * Process Colordata1.csv and convert to structured JSON database
 */

const csvPath = path.join(__dirname, '../ColorData/Colordata1.csv');
const outputPath = path.join(__dirname, '../src/data/paint-database.json');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const num = parseInt(n) || 0;
    const hex = num.toString(16).padStart(2, '0');
    return hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generate highlight color from base (25% lighter for metallic, 18% for solid)
 */
function generateHighlight(baseRGB, type) {
  const factor = (type === 'Metallic' || type === 'Pearl') ? 1.25 : 1.18;
  return {
    r: Math.min(255, Math.round(baseRGB.r * factor)),
    g: Math.min(255, Math.round(baseRGB.g * factor)),
    b: Math.min(255, Math.round(baseRGB.b * factor))
  };
}

/**
 * Generate shadow color from base (30% darker for metallic, 25% for solid)
 */
function generateShadow(baseRGB, type) {
  const factor = (type === 'Metallic' || type === 'Pearl') ? 0.70 : 0.75;
  return {
    r: Math.round(baseRGB.r * factor),
    g: Math.round(baseRGB.g * factor),
    b: Math.round(baseRGB.b * factor)
  };
}

/**
 * Parse RGB value, handling #N/A and empty values
 */
function parseRGB(value) {
  if (!value || value === '#N/A' || value.trim() === '') {
    return null;
  }
  const num = parseInt(value);
  return isNaN(num) ? null : num;
}

function processCSV() {
  console.log('Reading CSV file...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  console.log(`Total lines: ${lines.length}`);

  // Skip header
  const dataLines = lines.slice(1);

  const database = {
    brands: {},
    paintCodes: [],
    metadata: {
      totalCodes: 0,
      lastUpdated: new Date().toISOString(),
      source: 'Colordata1.csv',
    },
  };

  console.log('Processing paint codes...');

  dataLines.forEach((line, index) => {
    try {
      const fields = parseCSVLine(line);

      // Extract fields based on CSV structure
      const fullName = fields[0]; // "PLYMOUTH - PGF - Emerald Green Metallic"
      const asinProKit = fields[1];
      const asinEssentialKit = fields[2];
      const asinPremiumKit = fields[3];
      const asinBasicKit = fields[4];
      const productTitle = fields[5];
      const msrp = fields[6];
      const brand = fields[7]?.trim(); // "PLYMOUTH "

      // RGB values from CSV (columns 9-17)
      const red1 = parseRGB(fields[9]);    // Highlight
      const green1 = parseRGB(fields[10]);
      const blue1 = parseRGB(fields[11]);
      const red2 = parseRGB(fields[12]);   // Base
      const green2 = parseRGB(fields[13]);
      const blue2 = parseRGB(fields[14]);
      const red3 = parseRGB(fields[15]);   // Shadow
      const green3 = parseRGB(fields[16]);
      const blue3 = parseRGB(fields[17]);

      const type = fields[18] || 'Solid'; // Metallic, Pearl, Solid
      const gloss = fields[19] || 'Medium'; // High, Medium, Low

      // Parse paint code from fullName
      // Format: "BRAND - CODE - Color Name"
      const parts = fullName.split(' - ');
      if (parts.length < 3) {
        console.warn(`Skipping malformed line ${index + 2}: ${fullName}`);
        return;
      }

      const paintCode = parts[1].trim();
      const colorName = parts.slice(2).join(' - ').trim();

      // Determine base color (RGB2) - this is the main color
      let baseRGB = { r: 0, g: 0, b: 0 };
      if (red2 !== null && green2 !== null && blue2 !== null) {
        baseRGB = { r: red2, g: green2, b: blue2 };
      } else if (red1 !== null && green1 !== null && blue1 !== null) {
        // Fallback to RGB1 if RGB2 missing
        baseRGB = { r: red1, g: green1, b: blue1 };
      }

      // Get or generate highlight (RGB1)
      let highlightRGB;
      if (red1 !== null && green1 !== null && blue1 !== null) {
        highlightRGB = { r: red1, g: green1, b: blue1 };
      } else {
        highlightRGB = generateHighlight(baseRGB, type);
      }

      // Get or generate shadow (RGB3)
      let shadowRGB;
      if (red3 !== null && green3 !== null && blue3 !== null) {
        shadowRGB = { r: red3, g: green3, b: blue3 };
      } else {
        shadowRGB = generateShadow(baseRGB, type);
      }

      // Create paint code entry with full RGB structure
      const paintEntry = {
        code: paintCode,
        name: colorName,
        brand: brand,
        type: type,
        gloss: gloss,
        rgb: {
          highlight: highlightRGB,
          base: baseRGB,
          shadow: shadowRGB,
        },
        hex: {
          highlight: rgbToHex(highlightRGB.r, highlightRGB.g, highlightRGB.b),
          base: rgbToHex(baseRGB.r, baseRGB.g, baseRGB.b),
          shadow: rgbToHex(shadowRGB.r, shadowRGB.g, shadowRGB.b),
        },
        purchaseLinks: {
          erapaints: asinBasicKit && asinBasicKit !== '#N/A'
            ? `https://www.amazon.com/dp/${asinBasicKit}`
            : null,
          amazon: asinBasicKit && asinBasicKit !== '#N/A'
            ? `https://www.amazon.com/dp/${asinBasicKit}`
            : null,
        },
        products: {
          basicKit: asinBasicKit !== '#N/A' ? asinBasicKit : null,
          essentialKit: asinEssentialKit !== '#N/A' ? asinEssentialKit : null,
          proKit: asinProKit !== '#N/A' ? asinProKit : null,
          premiumKit: asinPremiumKit !== '#N/A' ? asinPremiumKit : null,
        },
        price: msrp,
      };

      database.paintCodes.push(paintEntry);

      // Group by brand
      if (!database.brands[brand]) {
        database.brands[brand] = {
          name: brand,
          codes: [],
        };
      }
      database.brands[brand].codes.push(paintCode);

    } catch (error) {
      console.error(`Error processing line ${index + 2}:`, error.message);
    }
  });

  database.metadata.totalCodes = database.paintCodes.length;

  console.log(`Processed ${database.paintCodes.length} paint codes`);
  console.log(`Brands found: ${Object.keys(database.brands).length}`);

  // Write to JSON file
  console.log('Writing database to JSON...');
  fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));

  console.log(`✅ Database saved to: ${outputPath}`);
  console.log('\nSummary:');
  console.log(`- Total paint codes: ${database.metadata.totalCodes}`);
  console.log(`- Total brands: ${Object.keys(database.brands).length}`);
  console.log(`- Brands: ${Object.keys(database.brands).sort().join(', ')}`);
}

// Run the processor
try {
  processCSV();
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
