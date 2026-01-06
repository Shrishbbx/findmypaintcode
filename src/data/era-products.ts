/**
 * ERA Paints Product Catalog
 * Scraped from erapaints.com
 */

export interface EraProduct {
  id: string;
  name: string;
  category: 'touchup' | 'spray';
  tier: 'pro' | 'premium' | 'essential' | 'basic';
  imageUrl: string;
  productUrl: string;
  price?: string;
  description: string;
  bestFor: string[];
}

export const ERA_PRODUCTS: EraProduct[] = [
  // ============ TOUCH-UP JARS AND KITS ============
  {
    id: 'touchup-pro-kit',
    name: 'Pro Kit',
    category: 'touchup',
    tier: 'pro',
    imageUrl: 'https://erapaints.com/wp-content/uploads/2020/07/Automotive-Touchup-Paint-Clearcoat-Primer-Prep-Kit-600x600.jpg',
    productUrl: 'https://erapaints.com/product/automotive-touchup-paint-clearcoat-primer-and-prep-kit/',
    description: 'Complete professional kit with paint, clearcoat, primer, and prep tools',
    bestFor: ['Small chips', 'Rock chips', 'Minor scratches', 'Professional results'],
  },
  {
    id: 'touchup-premium-kit',
    name: 'Premium Kit',
    category: 'touchup',
    tier: 'premium',
    imageUrl: 'https://erapaints.com/wp-content/uploads/2020/07/Automotive-Touchup-Paint-Clearcoat-Primer-600x600.jpg',
    productUrl: 'https://erapaints.com/product/automotive-touchup-paint-clearcoat-and-primer/',
    description: 'Premium kit with paint, clearcoat, and primer',
    bestFor: ['Small chips', 'Rock chips', 'Surface scratches'],
  },
  {
    id: 'touchup-essential-kit',
    name: 'Essential Kit',
    category: 'touchup',
    tier: 'essential',
    imageUrl: 'https://erapaints.com/wp-content/uploads/2020/07/Automotive-Touchup-Paint-with-Clearcoat-300x300.jpg',
    productUrl: 'https://erapaints.com/product/automotive-touchup-paint-with-clearcoat/',
    description: 'Essential kit with paint and clearcoat',
    bestFor: ['Small chips', 'Minor scratches', 'Quick fixes'],
  },
  {
    id: 'touchup-basic-kit',
    name: 'Basic Kit',
    category: 'touchup',
    tier: 'basic',
    imageUrl: 'https://erapaints.com/wp-content/uploads/2020/07/Automotive-Touch-Up-Paint-300x300.jpg',
    productUrl: 'https://erapaints.com/product/automotive-touchup-paint/',
    description: 'Basic touch-up paint jar',
    bestFor: ['Tiny chips', 'Quick touch-ups', 'Budget repairs'],
  },

  // ============ AUTOMOTIVE SPRAY PAINTS ============
  {
    id: 'spray-pro-kit',
    name: 'Pro Kit',
    category: 'spray',
    tier: 'pro',
    imageUrl: 'https://erapaints.com/wp-content/uploads/2020/07/Automotive-Spray-Paint-Clearcoat-Primer-and-Pro-Kit-600x600.jpg',
    productUrl: 'https://erapaints.com/product/automotive-spray-paint-clearcoat-primer-and-pro-kit/',
    description: 'Complete pro spray kit with paint, clearcoat, primer, and prep tools',
    bestFor: ['Large panels', 'Bumpers', 'Full repaints', 'Professional finish'],
  },
  {
    id: 'spray-premium-kit',
    name: 'Premium Kit',
    category: 'spray',
    tier: 'premium',
    imageUrl: 'https://erapaints.com/wp-content/uploads/2020/07/Automotive-Spray-Paint-Clearcoat-Primer-600x600.jpg',
    productUrl: 'https://erapaints.com/product/automotive-spray-paint-clearcoat-and-primer/',
    description: 'Premium spray kit with paint, clearcoat, and primer',
    bestFor: ['Panels', 'Large scratches', 'Medium repairs'],
  },
  {
    id: 'spray-essential-kit',
    name: 'Essential Kit',
    category: 'spray',
    tier: 'essential',
    imageUrl: 'https://erapaints.com/wp-content/uploads/2020/07/Automotive-Spray-Paint-Clearcoat-and-Pro-Prep-Kit-600x600.jpg',
    productUrl: 'https://erapaints.com/product/automotive-spray-paint-with-clearcoat/',
    description: 'Essential spray kit with paint and clearcoat',
    bestFor: ['Panels', 'Scratches', 'Standard repairs'],
  },
  {
    id: 'spray-basic-kit',
    name: 'Basic Spray Kit',
    category: 'spray',
    tier: 'basic',
    imageUrl: 'https://erapaints.com/wp-content/uploads/2020/07/Automotive-Spray-Paint-Only-and-Basic-Prep-Kit-600x600.jpg',
    productUrl: 'https://erapaints.com/product/automotive-spray-paint-and-basic-prep-kit/',
    description: 'Basic spray paint with prep kit',
    bestFor: ['Simple spray jobs', 'Budget repairs', 'Practice'],
  },
  {
    id: 'spray-paint-only',
    name: 'Spray Paint Only',
    category: 'spray',
    tier: 'basic',
    imageUrl: 'https://erapaints.com/wp-content/uploads/2020/07/Automotive-Spray-Paint-600x600.jpg',
    productUrl: 'https://erapaints.com/product/automotive-spray-paint/',
    description: 'Automotive spray paint only (no clear coat)',
    bestFor: ['Quick coverage', 'Undercoats', 'Base layers'],
  },
];

// Category links
export const ERA_CATEGORY_LINKS = {
  touchup: 'https://erapaints.com/product-category/touch-up-paint/',
  spray: 'https://erapaints.com/product-category/spray-paint/',
};

/**
 * Get recommended product based on repair type
 */
export function getRecommendedProduct(repairType?: string): {
  category: 'touchup' | 'spray';
  tier: 'pro' | 'premium' | 'essential' | 'basic';
  reason: string;
} {
  const type = repairType?.toLowerCase() || '';

  // Touch-up jar recommended for small/minor damage
  if (
    type.includes('chip') ||
    type.includes('rock') ||
    type.includes('small') ||
    type.includes('minor') ||
    type.includes('tiny') ||
    type.includes('touchup') ||
    type.includes('touch-up')
  ) {
    return {
      category: 'touchup',
      tier: 'premium',
      reason: 'Perfect for small chips and rock damage',
    };
  }

  // Spray paint recommended for larger damage
  if (
    type.includes('large') ||
    type.includes('panel') ||
    type.includes('bumper') ||
    type.includes('deep') ||
    type.includes('scratch') ||
    type.includes('area')
  ) {
    return {
      category: 'spray',
      tier: 'premium',
      reason: 'Best for larger areas and deep scratches',
    };
  }

  // Default: touch-up for general use
  return {
    category: 'touchup',
    tier: 'essential',
    reason: 'Versatile solution for most repairs',
  };
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: 'touchup' | 'spray'): EraProduct[] {
  return ERA_PRODUCTS.filter(p => p.category === category);
}

/**
 * Get specific product
 */
export function getProduct(category: 'touchup' | 'spray', tier: 'pro' | 'premium' | 'essential' | 'basic'): EraProduct | undefined {
  return ERA_PRODUCTS.find(p => p.category === category && p.tier === tier);
}
