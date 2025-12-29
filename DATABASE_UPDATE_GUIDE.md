# 📊 Database Update Guide

## When to Update

Update your database whenever you:
- ✅ Add new paint products to your catalog
- ✅ Update RGB values for existing paints
- ✅ Change ASINs or product links
- ✅ Modify pricing information

---

## 🚀 Quick Update Process

### **Step 1: Update Your CSV File**

Edit the file: `ColorData/Colordata1.csv`

**Add new products OR modify existing rows**

Example new row:
```csv
TOYOTA - 1F7 - Classic Silver Metallic,B09ABC123,B09ABC456,B09ABC789,B09ABC000,ERA Paints 1F7 - Classic Silver Metallic for TOYOTA Exact Match Automotive Touch Up Paint Jar - Basic Kit,$17.99,TOYOTA,TOYOTA - 1F7 - Classic Silver Metallic,192,192,192,128,128,128,64,64,64,Metallic,High
```

**Important Columns:**
- **Identifier** (Column 9): `BRAND - CODE - COLOR NAME` (must be exact!)
- **RGB Values**: Red1,Green1,Blue1 (base color)
- **ASINs**: Pro Kit, Essential Kit, Premium Kit, Basic Kit
- **Price**: MSRP (e.g., $17.99)

### **Step 2: Run the Update Command**

Open your terminal and run:

```bash
npm run update-database
```

That's it! The script automatically:
1. ✅ Merges your updated Colordata1 with Martin/Valspar reference data
2. ✅ Creates Tier 1 (products you sell)
3. ✅ Creates Tier 2 (reference database)
4. ✅ Generates all necessary JSON files

### **Step 3: Verify the Update**

Check the output files in `ColorData/`:
- `tier1-products.json` - Your product catalog (should have new products)
- `tier2-reference.json` - OEM reference (unchanged unless new brands)
- `merged-paint-database.json` - Combined data (backup)

---

## 📋 Common Scenarios

### **Scenario A: Adding 10 New Paint Products**

```bash
1. Open ColorData/Colordata1.csv
2. Add 10 new rows at the bottom
3. Save the file
4. Run: npm run update-database
5. Done! 🎉
```

**Output:**
```
✅ Database update complete!
   Total products: 5,996 (was 5,986)
   +10 new products added
```

### **Scenario B: Updating RGB Values**

```bash
1. Open ColorData/Colordata1.csv
2. Find the row to update (search by paint code)
3. Change Red1, Green1, Blue1 values
4. Save the file
5. Run: npm run update-database
6. Done! 🎉
```

### **Scenario C: Changing ASINs**

```bash
1. Open ColorData/Colordata1.csv
2. Find the product row
3. Update ASIN columns (Pro Kit, Essential Kit, etc.)
4. Save the file
5. Run: npm run update-database
6. Done! 🎉
```

---

## 🔧 Manual Process (Advanced)

If you want to run steps individually:

```bash
# Step 1: Merge data
npm run merge-data

# Step 2: Create tiered database
node scripts/prepare-tiered-database.js
```

---

## 📂 File Structure

```
ColorData/
├── Colordata1.csv                      ← EDIT THIS FILE
├── SHRISH_MODIFIED_ERA_Martin_UsageList.csv   (reference, don't edit)
├── SHRISH MODIFIED_ERA_Valspar_UsageList.csv  (reference, don't edit)
├── merged-paint-database.json          (generated)
├── tier1-products.json                 (generated - YOUR PRODUCTS)
└── tier2-reference.json                (generated - OEM REFERENCE)
```

---

## ⚠️ Important Rules

### **DO:**
- ✅ Always use the exact format: `BRAND - CODE - COLOR NAME`
- ✅ Keep all columns in the same order
- ✅ Use semicolons to separate multiple ASINs
- ✅ Run `npm run update-database` after every change

### **DON'T:**
- ❌ Don't edit Martin or Valspar CSV files (they're reference only)
- ❌ Don't manually edit the JSON files (they're auto-generated)
- ❌ Don't change the column order in Colordata1.csv
- ❌ Don't skip running the update command

---

## 🐛 Troubleshooting

### **Error: "Cannot find Colordata1.csv"**
**Fix:** Make sure the file is in `ColorData/` folder

### **Error: "Invalid identifier format"**
**Fix:** Check that your identifier follows: `BRAND - CODE - NAME`
- Must have exactly 2 dashes with spaces around them
- Example: `TOYOTA - 1F7 - Classic Silver` ✅
- NOT: `TOYOTA-1F7-Classic Silver` ❌

### **Error: "No products found"**
**Fix:** Make sure your CSV has data rows (not just headers)

---

## 🚀 Future: Automated Updates

Once you set up Supabase, the process will be:

```bash
1. Edit Colordata1.csv
2. Run: npm run update-database
3. Run: npm run deploy-to-supabase
4. Changes live instantly! 🎉
```

---

## 📞 Need Help?

If you run into issues:
1. Check this guide first
2. Look at the error message
3. Make sure your CSV format matches the examples
4. Ask Claude Code: "I'm getting this error when updating database: [paste error]"

---

**Last Updated:** December 28, 2024
