// Paint code data types

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface PaintCodeRGB {
  highlight: RGBColor;  // Lighter reflection (RGB1)
  base: RGBColor;       // Main color (RGB2)
  shadow: RGBColor;     // Darker shade (RGB3)
}

export interface PaintCodeHex {
  highlight: string;  // Hex for highlight
  base: string;       // Hex for base
  shadow: string;     // Hex for shadow
}

export interface PaintCode {
  code: string;
  name: string;
  brand: string;
  type: 'Metallic' | 'Pearl' | 'Solid' | string;
  gloss: 'High' | 'Medium' | 'Low' | string;

  // Three-tier RGB structure for realistic swatch rendering
  rgb: PaintCodeRGB;
  hex: PaintCodeHex;

  // Links to ERAPAINTS store, Amazon, etc.
  purchaseLinks?: {
    erapaints?: string | null;
    amazon?: string | null;
    walmart?: string | null;
  };

  // ERA Paints product ASINs
  products?: {
    basicKit?: string | null;
    essentialKit?: string | null;
    proKit?: string | null;
    premiumKit?: string | null;
  };

  price?: string;
}

export interface CarModel {
  name: string;
  years: number[];
  paintCodes: PaintCode[];
  // Location hints for finding paint code on this model
  codeLocations?: string[];
}

export interface CarBrand {
  name: string;
  slug: string;
  models: CarModel[];
  // General location hints for this brand
  codeLocations?: string[];
}

// Chatbot types

export type ChatStep =
  | 'welcome'
  | 'select-brand'
  | 'select-model'
  | 'select-year'
  | 'confirm-vehicle'
  | 'select-color'
  | 'show-location'
  | 'result';

export interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  // For bot messages with options
  options?: ChatOption[];
  // For image upload messages
  imageUrl?: string;
  // For video instructional content
  videoData?: {
    brand: string;
  };
}

export interface ChatOption {
  label: string;
  value: string;
  // Optional: show color swatch
  hex?: string;
}

export interface ChatState {
  step: ChatStep;
  messages: ChatMessage[];
  selectedBrand: string | null;
  selectedModel: string | null;
  selectedYear: number | null;
  selectedPaintCode: string | null;
  uploadedImage: string | null;
  isTyping: boolean;
}

// Result page types

export interface PaintCodeResult {
  brand: CarBrand;
  model: CarModel;
  year: number;
  paintCode: PaintCode;
  codeLocations: string[];
}

// Enhanced chatbot types for new features

export type ConversationStage =
  | 'welcome'
  | 'gathering_info'
  | 'verifying_color'
  | 'offering_vin_fallback'
  | 'diagnosing_problem'
  | 'researching_location'
  | 'researching_era_content'
  | 'ready_for_result';

export interface DetectedInfo {
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  paintCode?: string | null;
  colorName?: string | null;
  hexColor?: string | null;

  // New fields for enhanced flow
  colorVerified?: boolean;
  imageType?: 'car' | 'vin' | null;
  vinNumber?: string | null;
  repairProblem?: string | null;
  repairType?: string | null;
  recommendedProduct?: string | null;
  resultUrl?: string | null;

  // Research results
  paintLocationResearch?: {
    locations: string[];
    sources: string[];
    researched: boolean;
  };

  eraContent?: {
    article?: {
      title: string;
      url: string;
      snippet: string;
    };
    video?: {
      title: string;
      videoId: string;
      url: string;
      thumbnail: string;
    };
    researched: boolean;
  };
}

// Web search types

export interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
  relevanceScore?: number;
}

export interface WebSearchResponse {
  success: boolean;
  results: WebSearchResult[];
  cached: boolean;
  error?: string;
}

// Paint location research types

export interface PaintLocationResearch {
  locations: string[];
  sources: string[];
  researched: boolean;
  researchedAt: Date;
  cacheKey: string;
}

export interface PaintLocationResponse {
  success: boolean;
  locations: string[];
  sources: string[];
  cached: boolean;
  error?: string;
}

// ERA Paints content types

export interface EraPaintsArticle {
  title: string;
  url: string;
  snippet: string;
  relevance: number;
}

export interface EraPaintsVideo {
  title: string;
  videoId: string;
  url: string;
  thumbnail: string;
  description?: string;
  relevance: number;
}

export interface EraContentResponse {
  success: boolean;
  article?: EraPaintsArticle;
  video?: EraPaintsVideo;
  cached: boolean;
  error?: string;
}

// Repair diagnosis types

export type RepairType = 'chip' | 'scratch' | 'large-area' | 'rust' | 'touchup';
export type RecommendedProduct = 'touch-up-pen' | 'spray-can' | 'complete-kit';

export interface RepairDiagnosis {
  problem: string;
  repairType: RepairType;
  recommendedProduct: RecommendedProduct;
  productName: string;
  confidence: number;
}

export interface DiagnoseRepairResponse {
  success: boolean;
  diagnosis?: RepairDiagnosis;
  error?: string;
}

// VIN analysis types

export interface VinData {
  vin?: string;
  brand?: string;
  model?: string;
  year?: number;
  paintCode?: string;
  colorName?: string;
  hexColor?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface VinAnalysisResponse {
  success: boolean;
  vinData?: VinData;
  error?: string;
}
