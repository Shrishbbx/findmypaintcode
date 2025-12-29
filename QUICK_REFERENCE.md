# Paint Code Result Page - Quick Reference

## Key Files

```
src/app/paint-code/[brand]/[model]/[year]/[paintCode]/page.tsx
  └─ Main result page component

src/types/index.ts
  └─ TypeScript interfaces

src/data/paint-codes.ts
  └─ Paint code database
```

## Quick Snippets

### Add New Paint Code
```typescript
// In src/data/paint-codes.ts
{
  code: 'YR506M',
  name: 'Desert Mist Metallic',
  hex: '#A89C94',
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
```

### Generate Amazon Link from ASIN
```typescript
const amazonUrl = `https://amazon.com/dp/${asin}`;
```

### Update Pricing
```typescript
// Option 1: In paint code data
eraProduct: {
  price: '$19.99' // Update here
}

// Option 2: Dynamic (future)
const price = await fetchLatestPrice(asin);
```

### Add Trust Badge
```tsx
<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-blue-200 rounded-full text-sm font-medium text-gray-700">
  <svg>{/* icon */}</svg>
  Your Badge Text
</span>
```

### Add Product Option
```tsx
<div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
  <div className="flex items-center justify-between mb-1">
    <span className="text-sm font-semibold">Product Name</span>
    <span className="text-sm font-bold">$XX.XX</span>
  </div>
  <p className="text-xs text-blue-100">Description of use case</p>
</div>
```

### Customize Colors
```typescript
// In src/app/globals.css
:root {
  --primary: #2563eb;        // Blue - Change brand color
  --primary-hover: #1d4ed8;  // Darker blue
}
```

## Common Tasks

### Test Local Result Page
```bash
npm run dev
# Visit: http://localhost:3000/paint-code/toyota/camry/2023/040
```

### Build for Production
```bash
npm run build
npm run start
```

### View All Static Pages
```bash
# After build, check:
.next/server/app/paint-code/[brand]/[model]/[year]/[paintCode]/page.html
```

## Styling Conventions

### Gradients
```tsx
// Hero cards
className="bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50"

// Purchase card
className="bg-gradient-to-br from-blue-600 to-blue-700"

// Help card
className="bg-gradient-to-br from-purple-50 to-pink-50"
```

### Rounded Corners
```tsx
rounded-xl    // 12px - Small cards, buttons
rounded-2xl   // 16px - Large cards
rounded-3xl   // 24px - Hero sections
rounded-full  // Pills, badges
```

### Spacing
```tsx
gap-2   // 8px
gap-3   // 12px
gap-4   // 16px
gap-6   // 24px
gap-8   // 32px

p-4     // 16px padding
p-6     // 24px padding
p-8     // 32px padding
```

## Design Tokens

### Colors
```css
/* Primary (Blue) */
blue-50: #eff6ff
blue-100: #dbeafe
blue-600: #2563eb
blue-700: #1d4ed8

/* Success (Green) */
green-50: #f0fdf4
green-600: #16a34a
green-700: #15803d

/* Accent (Purple/Pink) */
purple-50: #faf5ff
purple-100: #f3e8ff
pink-50: #fdf2f8

/* Neutral (Gray) */
gray-50: #f9fafb
gray-100: #f3f4f6
gray-600: #4b5563
gray-900: #111827
```

### Typography
```tsx
// Headings
text-4xl md:text-5xl  // Paint code (36px → 48px)
text-3xl md:text-4xl  // Vehicle title (30px → 36px)
text-xl md:text-2xl   // Color name (20px → 24px)

// Body
text-base  // 16px
text-sm    // 14px
text-xs    // 12px
```

## Conversion Elements

### Success Indicators
```tsx
// Green badge
<div className="bg-green-50 border border-green-200 rounded-full">
  <CheckIcon className="text-green-600" />
  Perfect Match Found!
</div>

// Checkmark on swatch
<div className="absolute -bottom-2 -right-2 bg-white rounded-full shadow-md">
  <CheckIcon className="text-green-500" />
</div>
```

### Trust Signals
```tsx
// In purchase card
<div className="flex items-center gap-2 text-sm">
  <LockIcon className="w-5 h-5" />
  <span>Color Match Guarantee</span>
</div>
```

### CTAs
```tsx
// Primary CTA
<a className="bg-white text-blue-600 rounded-xl font-bold hover:scale-105">
  Shop ERA Paints →
</a>

// Secondary CTA
<a className="bg-gray-50 rounded-xl hover:bg-gray-100">
  Amazon →
</a>
```

## Responsive Breakpoints

```tsx
// Mobile first approach
className="text-3xl md:text-4xl"  // Mobile: 30px, Desktop: 36px

// Grid layout
className="grid grid-cols-1 lg:grid-cols-3"  // Mobile: 1 col, Desktop: 3 cols

// Padding
className="px-4 md:px-8"  // Mobile: 16px, Desktop: 32px
```

## Icons

Using Heroicons (already in project):

```tsx
// Checkmark
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
</svg>

// Arrow Right
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
</svg>

// Location Pin
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
</svg>
```

## Performance Tips

### Image Optimization
```tsx
import Image from 'next/image';

// For diagrams (when added)
<Image
  src="/diagrams/toyota-camry-location.jpg"
  alt="Paint code location diagram"
  width={600}
  height={400}
  loading="lazy"
/>
```

### Sticky Elements
```tsx
// Use CSS only (no JavaScript)
<div className="sticky top-24">
  {/* Sticky sidebar content */}
</div>
```

### Hover Effects
```tsx
// Use transforms for GPU acceleration
className="hover:scale-105 transition-transform"
className="hover:-translate-x-1 transition-transform"
```

## Troubleshooting

### Paint Code Not Found
```typescript
// Check data exists
const paintCode = model.paintCodes.find(
  p => p.code.toLowerCase().replace(/\s+/g, '-') === paintCodeSlug
);
if (!paintCode) notFound();  // Shows 404
```

### Styling Not Applying
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Static Generation Failing
```bash
# Check all paths are valid
npm run build  # Shows which pages failed
```

## Analytics Integration

### Track Purchase Clicks
```tsx
<a
  href={amazonLink}
  onClick={() => {
    // Google Analytics
    gtag('event', 'click_purchase', {
      brand: 'ERA Paints',
      paint_code: paintCode.code,
      price: paintCode.eraProduct?.price
    });
  }}
>
  Shop ERA Paints
</a>
```

### Track Page Views
```tsx
// In page component
useEffect(() => {
  gtag('event', 'page_view', {
    page_title: `${paintCode.code} ${paintCode.name}`,
    page_location: window.location.href
  });
}, []);
```

## SEO Optimization

### Meta Tags (Already Implemented)
```typescript
export async function generateMetadata({ params }: PageProps) {
  return {
    title: `${paintCode.code} ${paintCode.name} - ${year} ${brand.name} ${model.name} Paint Code`,
    description: `Find touch-up paint for your ${year} ${brand.name} ${model.name}...`
  };
}
```

### Add Product Schema (Recommended)
```tsx
// In page component
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": `${paintCode.code} ${paintCode.name}`,
  "brand": "ERA Paints",
  "offers": {
    "@type": "Offer",
    "price": paintCode.eraProduct?.price?.replace('$', ''),
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
})}
</script>
```

## Deployment

### Build Command
```bash
npm run build
```

### Environment Variables (if needed)
```env
# .env.local
NEXT_PUBLIC_AFFILIATE_ID=your-affiliate-id
AMAZON_API_KEY=your-api-key
```

### Netlify Configuration
Already set in `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "out"
```

## Future Enhancements Checklist

### Phase 1 (Quick Wins)
- [ ] Add vehicle location diagrams
- [ ] Implement real pricing API
- [ ] Add product variant selector
- [ ] Include customer reviews

### Phase 2 (Medium Priority)
- [ ] Email paint code reminder
- [ ] Share on social media
- [ ] Print-friendly version
- [ ] Save to favorites

### Phase 3 (Advanced)
- [ ] AR color preview
- [ ] Live chat support
- [ ] Video tutorials
- [ ] Body shop finder

## Contact & Support

For design questions or implementation help:
1. Check the documentation files
2. Review the comparison guide
3. Test with placeholder data first
4. Validate against production build

## Version History

- **v2.0** (Current) - Complete redesign with gradients, sticky sidebar, trust signals
- **v1.0** (Original) - Basic card layout with minimal styling
