# ERA Paints Data Integration Guide

## Overview
This guide explains how to integrate the ERA Paints spreadsheet data into the FindMyPaintCode application.

## Current Data Structure (Your Spreadsheet)

```
ASIN: B09GRYMGSN
Product: ERA Paints YR506M - Desert Mist Metallic for ACURA
Price: $17.99
Identifier: ACURA - YR506M - Desert Mist Metallic
Brand: ACURA
Paint Code: YR506M
Color Name: Desert Mist Metallic
Amazon Link: https://amazon.com/dp/B09GRYMGSN
```

## Application Data Structure

### TypeScript Interface
```typescript
// src/types/index.ts
export interface PaintCode {
  code: string;                    // "YR506M"
  name: string;                    // "Desert Mist Metallic"
  hex?: string;                    // "#A89C94" (optional)
  purchaseLinks?: {
    erapaints?: string;            // ERA Paints store link
    amazon?: string;               // Full Amazon URL
    walmart?: string;              // Walmart link (if available)
  };
  eraProduct?: {
    asin?: string;                 // "B09GRYMGSN"
    productName?: string;          // "ERA Paints YR506M - Desert Mist..."
    price?: string;                // "$17.99"
  };
}
```

## Data Mapping

### From Spreadsheet to Application

```javascript
// Example transformation from CSV to TypeScript object
const csvRow = {
  ASIN: "B09GRYMGSN",
  Product: "ERA Paints YR506M - Desert Mist Metallic for ACURA",
  Price: "$17.99",
  Identifier: "ACURA - YR506M - Desert Mist Metallic",
  Brand: "ACURA",
  PaintCode: "YR506M",
  ColorName: "Desert Mist Metallic",
  AmazonLink: "https://amazon.com/dp/B09GRYMGSN"
};

// Transforms to:
const paintCode = {
  code: csvRow.PaintCode,                    // "YR506M"
  name: csvRow.ColorName,                    // "Desert Mist Metallic"
  hex: getHexColor(csvRow.ColorName),        // Calculate or lookup
  purchaseLinks: {
    erapaints: csvRow.AmazonLink,            // Use Amazon as ERA Paints for now
    amazon: csvRow.AmazonLink
  },
  eraProduct: {
    asin: csvRow.ASIN,
    productName: csvRow.Product,
    price: csvRow.Price
  }
};
```

## CSV Import Script (Recommended)

### Step 1: Install CSV Parser
```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

### Step 2: Create Import Script
```typescript
// scripts/import-paint-codes.ts
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

interface CSVRow {
  ASIN: string;
  Product: string;
  Price: string;
  Identifier: string;
  Brand: string;
  PaintCode: string;
  ColorName: string;
  AmazonLink: string;
}

function parseCSV(filePath: string): Promise<CSVRow[]> {
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvContent, {
      header: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
}

async function generatePaintCodeData() {
  const csvPath = path.join(__dirname, '../data/era-paints.csv');
  const rows = await parseCSV(csvPath);

  // Group by brand
  const brandMap = new Map();

  rows.forEach(row => {
    if (!brandMap.has(row.Brand)) {
      brandMap.set(row.Brand, {
        name: row.Brand,
        slug: row.Brand.toLowerCase(),
        models: new Map()
      });
    }

    // Extract model from Identifier or Product name
    // "ACURA - YR506M - Desert Mist Metallic"
    const identifier = row.Identifier.split(' - ');
    const modelName = extractModel(identifier);

    // Add paint code to model
    const brand = brandMap.get(row.Brand);
    if (!brand.models.has(modelName)) {
      brand.models.set(modelName, {
        name: modelName,
        years: [], // You'll need to add year data
        paintCodes: []
      });
    }

    brand.models.get(modelName).paintCodes.push({
      code: row.PaintCode,
      name: row.ColorName,
      hex: getHexFromColorName(row.ColorName), // Helper function
      purchaseLinks: {
        erapaints: row.AmazonLink,
        amazon: row.AmazonLink
      },
      eraProduct: {
        asin: row.ASIN,
        productName: row.Product,
        price: row.Price
      }
    });
  });

  // Convert to array and write to file
  const brands = Array.from(brandMap.values()).map(brand => ({
    ...brand,
    models: Array.from(brand.models.values())
  }));

  const outputPath = path.join(__dirname, '../src/data/paint-codes.ts');
  const content = `// Auto-generated from ERA Paints CSV
// Last updated: ${new Date().toISOString()}

import { CarBrand } from '@/types';

export const carBrands: CarBrand[] = ${JSON.stringify(brands, null, 2)};
`;

  fs.writeFileSync(outputPath, content);
  console.log(`✅ Generated ${brands.length} brands`);
}

generatePaintCodeData().catch(console.error);
```

### Step 3: Run Import
```bash
npm run import-paint-codes
```

## Manual Data Entry (Alternative)

If you prefer manual entry for now, here's the format:

```typescript
// src/data/paint-codes.ts
export const carBrands: CarBrand[] = [
  {
    name: 'Acura',
    slug: 'acura',
    codeLocations: ['Driver side door jamb'],
    models: [
      {
        name: 'TLX',
        years: [2020, 2021, 2022, 2023, 2024],
        paintCodes: [
          {
            code: 'YR506M',
            name: 'Desert Mist Metallic',
            hex: '#A89C94', // Approximate - use actual hex if available
            purchaseLinks: {
              erapaints: 'https://amazon.com/dp/B09GRYMGSN',
              amazon: 'https://amazon.com/dp/B09GRYMGSN'
            },
            eraProduct: {
              asin: 'B09GRYMGSN',
              productName: 'ERA Paints YR506M - Desert Mist Metallic for ACURA',
              price: '$17.99'
            }
          }
          // ... more paint codes
        ]
      }
      // ... more models
    ]
  }
  // ... more brands
];
```

## Amazon Link Formats

### Using ASIN
```typescript
// Short format (preferred)
const amazonUrl = `https://amazon.com/dp/${asin}`;
// Example: https://amazon.com/dp/B09GRYMGSN

// With affiliate tag (if applicable)
const affiliateUrl = `https://amazon.com/dp/${asin}?tag=youraffiliateId`;
```

### Search Fallback
```typescript
// If no specific ASIN available
const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(
  `${brand} ${paintCode} touch up paint`
)}`;
```

## Color Hex Code Extraction

### Option 1: Manual Lookup
Use automotive paint databases or color matching tools to find hex codes.

### Option 2: Color Name to Hex Mapping
```typescript
// Helper function
const colorNameToHex: Record<string, string> = {
  'Super White': '#FFFFFF',
  'Black': '#000000',
  'Desert Mist Metallic': '#A89C94',
  // ... build this mapping
};

function getHexFromColorName(colorName: string): string {
  return colorNameToHex[colorName] || '#CCCCCC'; // Default gray
}
```

### Option 3: AI-Based Extraction
Use GPT-4 Vision or similar to analyze color swatches and extract hex codes.

## Data Validation

### Required Fields
```typescript
// Validate paint code data
function validatePaintCode(paintCode: PaintCode): boolean {
  if (!paintCode.code || !paintCode.name) {
    console.error('Missing required fields:', paintCode);
    return false;
  }

  if (paintCode.purchaseLinks?.amazon && !isValidUrl(paintCode.purchaseLinks.amazon)) {
    console.error('Invalid Amazon URL:', paintCode.purchaseLinks.amazon);
    return false;
  }

  if (paintCode.eraProduct?.asin && !isValidAsin(paintCode.eraProduct.asin)) {
    console.error('Invalid ASIN format:', paintCode.eraProduct.asin);
    return false;
  }

  return true;
}

function isValidAsin(asin: string): boolean {
  // ASIN format: 10 characters, alphanumeric
  return /^[A-Z0-9]{10}$/.test(asin);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

## Page Usage

The paint code result page automatically uses this data:

```tsx
// src/app/paint-code/[brand]/[model]/[year]/[paintCode]/page.tsx

// Data is already loaded via params
const paintCode = getPaintCodeByCode(model, paintCodeSlug);

// Amazon link generation
const amazonLink = paintCode.eraProduct?.asin
  ? `https://amazon.com/dp/${paintCode.eraProduct.asin}`
  : paintCode.purchaseLinks?.amazon
  || 'https://www.amazon.com/s?k=automotive+touch+up+paint';

// Display in UI
<a href={amazonLink} target="_blank" rel="noopener noreferrer">
  Shop ERA Paints
</a>

// Pricing display
{paintCode.eraProduct?.price && (
  <span>{paintCode.eraProduct.price}</span>
)}
```

## Dynamic Pricing Updates

### Option 1: API Integration
```typescript
// Fetch real-time pricing from Amazon Product Advertising API
async function getAmazonPrice(asin: string): Promise<string> {
  const response = await fetch(`/api/amazon/price/${asin}`);
  const data = await response.json();
  return data.price;
}
```

### Option 2: Scheduled Updates
```typescript
// Cron job to update prices daily
// scripts/update-prices.ts
async function updatePrices() {
  const products = await getAmazonPrices(asins);
  updatePaintCodeDatabase(products);
  rebuildStaticPages(); // Trigger Next.js rebuild
}
```

## Testing

### Test Data
```typescript
// Test with sample data
const testPaintCode: PaintCode = {
  code: 'TEST123',
  name: 'Test Color Metallic',
  hex: '#FF6B6B',
  purchaseLinks: {
    erapaints: 'https://amazon.com/dp/B00TEST123',
    amazon: 'https://amazon.com/dp/B00TEST123'
  },
  eraProduct: {
    asin: 'B00TEST123',
    productName: 'ERA Paints TEST123 - Test Color Metallic',
    price: '$19.99'
  }
};
```

### Validation Tests
```typescript
describe('Paint Code Data', () => {
  it('should have valid ASINs', () => {
    carBrands.forEach(brand => {
      brand.models.forEach(model => {
        model.paintCodes.forEach(pc => {
          if (pc.eraProduct?.asin) {
            expect(isValidAsin(pc.eraProduct.asin)).toBe(true);
          }
        });
      });
    });
  });

  it('should have valid Amazon URLs', () => {
    // Similar validation for URLs
  });
});
```

## Deployment Checklist

Before deploying with real ERA Paints data:

- [ ] CSV data cleaned and validated
- [ ] All ASINs verified as valid Amazon products
- [ ] Hex codes added for color swatches
- [ ] Price formatting consistent ($XX.XX)
- [ ] Product names match ERA Paints catalog
- [ ] Amazon links tested and working
- [ ] Static pages regenerated (`npm run build`)
- [ ] Sample pages tested in production build
- [ ] Analytics tracking implemented
- [ ] Affiliate tags added (if applicable)

## Data Security Considerations

### Public Data (Safe to expose)
- Paint codes
- Color names
- Hex values
- Amazon links
- Public pricing

### Private Data (Keep server-side)
- Affiliate IDs
- API keys
- Profit margins
- Wholesale pricing
- Admin data

### Implementation
```typescript
// Public (client-side)
export const carBrands: CarBrand[] = [...];

// Private (server-side API)
// api/products/[asin].ts
export async function GET(request: Request) {
  const { asin } = await params;
  const privateData = await getPrivateProductData(asin);
  // Only return public fields
  return {
    price: privateData.price,
    availability: privateData.availability
  };
}
```

## Maintenance

### Regular Tasks
1. **Monthly:** Update pricing from ERA Paints
2. **Quarterly:** Add new paint codes and models
3. **Yearly:** Archive discontinued colors
4. **As needed:** Fix broken Amazon links

### Update Process
```bash
# 1. Update CSV data
# 2. Run import script
npm run import-paint-codes

# 3. Validate data
npm run validate-data

# 4. Rebuild static pages
npm run build

# 5. Test locally
npm run start

# 6. Deploy
git add .
git commit -m "Update paint code database"
git push
```

## Support

For issues with data integration:
1. Check CSV format matches expected structure
2. Validate ASIN formats (10 characters, alphanumeric)
3. Ensure Amazon links are accessible
4. Verify hex codes are valid 6-digit hex
5. Test with a small dataset first

## Future Enhancements

### Advanced Features
- [ ] Real-time pricing from Amazon API
- [ ] Stock availability checking
- [ ] Multiple product variants per paint code
- [ ] User reviews integration
- [ ] Price history tracking
- [ ] Discount/promotion system
- [ ] Bundle deals (pen + spray + kit)
- [ ] International pricing support
