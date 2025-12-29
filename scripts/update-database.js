#!/usr/bin/env node
/**
 * Database Update Script
 *
 * Run this whenever you update Colordata1.csv
 *
 * This script automatically:
 * 1. Merges Colordata1 with Martin/Valspar data
 * 2. Creates two-tier database structure
 * 3. Generates deployment-ready JSON files
 *
 * Usage: npm run update-database
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Database Update Process\n');
console.log('═══════════════════════════════════════════\n');

const scripts = [
  {
    name: 'Step 1: Merge Paint Data',
    command: 'node scripts/merge-paint-data.js',
    description: 'Combining Colordata1 with vehicle reference data'
  },
  {
    name: 'Step 2: Create Two-Tier Database',
    command: 'node scripts/prepare-tiered-database.js',
    description: 'Separating products from reference data'
  }
];

let allSuccess = true;

for (const script of scripts) {
  console.log(`📌 ${script.name}`);
  console.log(`   ${script.description}\n`);

  try {
    execSync(script.command, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log(`\n✅ ${script.name} completed\n`);
  } catch (error) {
    console.error(`\n❌ ${script.name} failed`);
    console.error(error.message);
    allSuccess = false;
    break;
  }
}

console.log('═══════════════════════════════════════════\n');

if (allSuccess) {
  console.log('✅ Database update complete!\n');
  console.log('📂 Updated files:');
  console.log('   ├─ ColorData/merged-paint-database.json');
  console.log('   ├─ ColorData/tier1-products.json');
  console.log('   └─ ColorData/tier2-reference.json\n');
  console.log('🚀 Next steps:');
  console.log('   1. Review the updated files');
  console.log('   2. Upload to Supabase (when ready)');
  console.log('   3. Deploy to Netlify\n');
} else {
  console.log('❌ Database update failed\n');
  console.log('Please check the error messages above.\n');
  process.exit(1);
}
