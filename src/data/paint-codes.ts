import { CarBrand, CarModel, PaintCode } from '@/types';

// Placeholder data - will be replaced with actual CSV import later
// This structure demonstrates the data format for AI integration

export const carBrands: CarBrand[] = [
  {
    name: 'Toyota',
    slug: 'toyota',
    codeLocations: [
      'Driver side door jamb',
      'Under the hood on the firewall',
      'Inside the glove box'
    ],
    models: [
      {
        name: 'Camry',
        years: [2020, 2021, 2022, 2023, 2024],
        codeLocations: ['Driver side door jamb - look for a white sticker with C/TR codes'],
        paintCodes: [
          { code: '040', name: 'Super White', hex: '#FFFFFF' },
          { code: '1F7', name: 'Classic Silver Metallic', hex: '#C0C0C0' },
          { code: '218', name: 'Midnight Black Metallic', hex: '#1C1C1C' },
          { code: '3T3', name: 'Ruby Flare Pearl', hex: '#8B2942' },
          { code: '8X8', name: 'Blueprint', hex: '#1E3A5F' },
        ]
      },
      {
        name: 'Corolla',
        years: [2020, 2021, 2022, 2023, 2024],
        codeLocations: ['Driver side door jamb'],
        paintCodes: [
          { code: '040', name: 'Super White', hex: '#FFFFFF' },
          { code: '1G3', name: 'Magnetic Gray Metallic', hex: '#6B6B6B' },
          { code: '3U5', name: 'Supersonic Red', hex: '#CC0000' },
        ]
      },
      {
        name: 'RAV4',
        years: [2020, 2021, 2022, 2023, 2024],
        codeLocations: ['Driver side door jamb', 'Under the hood'],
        paintCodes: [
          { code: '040', name: 'Super White', hex: '#FFFFFF' },
          { code: '8X8', name: 'Blueprint', hex: '#1E3A5F' },
          { code: '6X3', name: 'Lunar Rock', hex: '#A8A89C' },
        ]
      }
    ]
  },
  {
    name: 'Honda',
    slug: 'honda',
    codeLocations: [
      'Driver side door jamb',
      'Inside the driver door frame'
    ],
    models: [
      {
        name: 'Civic',
        years: [2020, 2021, 2022, 2023, 2024],
        codeLocations: ['Driver side door jamb - look for a sticker with color code starting with NH or B'],
        paintCodes: [
          { code: 'NH-883P', name: 'Platinum White Pearl', hex: '#F5F5F5' },
          { code: 'NH-731P', name: 'Crystal Black Pearl', hex: '#1C1C1C' },
          { code: 'B-593M', name: 'Aegean Blue Metallic', hex: '#1E4D6B' },
          { code: 'R-569M', name: 'Rallye Red', hex: '#CC0000' },
        ]
      },
      {
        name: 'Accord',
        years: [2020, 2021, 2022, 2023, 2024],
        codeLocations: ['Driver side door jamb'],
        paintCodes: [
          { code: 'NH-883P', name: 'Platinum White Pearl', hex: '#F5F5F5' },
          { code: 'NH-830M', name: 'Lunar Silver Metallic', hex: '#C0C0C0' },
          { code: 'B-588P', name: 'Obsidian Blue Pearl', hex: '#1A2B4C' },
        ]
      },
      {
        name: 'CR-V',
        years: [2020, 2021, 2022, 2023, 2024],
        codeLocations: ['Driver side door jamb'],
        paintCodes: [
          { code: 'NH-883P', name: 'Platinum White Pearl', hex: '#F5F5F5' },
          { code: 'NH-731P', name: 'Crystal Black Pearl', hex: '#1C1C1C' },
          { code: 'R-580P', name: 'Radiant Red Metallic II', hex: '#8B0000' },
        ]
      }
    ]
  },
  {
    name: 'Ford',
    slug: 'ford',
    codeLocations: [
      'Driver side door jamb sticker',
      'Inside driver door edge'
    ],
    models: [
      {
        name: 'F-150',
        years: [2020, 2021, 2022, 2023, 2024],
        codeLocations: ['Driver side door jamb - look for paint code on the vehicle certification label'],
        paintCodes: [
          { code: 'YZ', name: 'Oxford White', hex: '#FFFFFF' },
          { code: 'UM', name: 'Agate Black Metallic', hex: '#1C1C1C' },
          { code: 'JS', name: 'Iconic Silver Metallic', hex: '#C0C0C0' },
          { code: 'E1', name: 'Velocity Blue Metallic', hex: '#0047AB' },
        ]
      },
      {
        name: 'Mustang',
        years: [2020, 2021, 2022, 2023, 2024],
        codeLocations: ['Driver side door jamb'],
        paintCodes: [
          { code: 'YZ', name: 'Oxford White', hex: '#FFFFFF' },
          { code: 'G1', name: 'Shadow Black', hex: '#1C1C1C' },
          { code: 'D4', name: 'Race Red', hex: '#CC0000' },
          { code: 'B5', name: 'Grabber Blue', hex: '#0080FF' },
        ]
      }
    ]
  },
  {
    name: 'Chevrolet',
    slug: 'chevrolet',
    codeLocations: [
      'Driver side door jamb',
      'Glove box'
    ],
    models: [
      {
        name: 'Silverado',
        years: [2020, 2021, 2022, 2023, 2024],
        codeLocations: ['Driver side door jamb - look for RPO sticker with paint code'],
        paintCodes: [
          { code: 'GAZ', name: 'Summit White', hex: '#FFFFFF' },
          { code: 'GBA', name: 'Black', hex: '#1C1C1C' },
          { code: 'G9K', name: 'Northsky Blue Metallic', hex: '#1E3A5F' },
          { code: 'GAN', name: 'Red Hot', hex: '#CC0000' },
        ]
      },
      {
        name: 'Camaro',
        years: [2020, 2021, 2022, 2023, 2024],
        codeLocations: ['Driver side door jamb'],
        paintCodes: [
          { code: 'GAZ', name: 'Summit White', hex: '#FFFFFF' },
          { code: 'GBA', name: 'Black', hex: '#1C1C1C' },
          { code: 'G7Q', name: 'Crush', hex: '#FF4500' },
          { code: 'GKK', name: 'Riverside Blue Metallic', hex: '#0047AB' },
        ]
      }
    ]
  }
];

// Helper functions for data lookup

export function getBrandBySlug(slug: string): CarBrand | undefined {
  return carBrands.find(b => b.slug.toLowerCase() === slug.toLowerCase());
}

export function getModelByName(brand: CarBrand, modelName: string): CarModel | undefined {
  return brand.models.find(m => m.name.toLowerCase() === modelName.toLowerCase());
}

export function getPaintCodeByCode(model: CarModel, code: string): PaintCode | undefined {
  return model.paintCodes.find(p => p.code.toLowerCase() === code.toLowerCase());
}

export function getAllBrandSlugs(): string[] {
  return carBrands.map(b => b.slug);
}

// For static generation - get all possible paint code paths
export function getAllPaintCodePaths(): { brand: string; model: string; year: string; paintCode: string }[] {
  const paths: { brand: string; model: string; year: string; paintCode: string }[] = [];

  for (const brand of carBrands) {
    for (const model of brand.models) {
      for (const year of model.years) {
        for (const paintCode of model.paintCodes) {
          paths.push({
            brand: brand.slug,
            model: model.name.toLowerCase().replace(/\s+/g, '-'),
            year: year.toString(),
            paintCode: paintCode.code.toLowerCase().replace(/\s+/g, '-'),
          });
        }
      }
    }
  }

  return paths;
}
