// Paint code data types

export interface PaintCode {
  code: string;
  name: string;
  hex?: string;
  // Links to ERAPAINTS store, Amazon, etc.
  purchaseLinks?: {
    erapaints?: string;
    amazon?: string;
    walmart?: string;
  };
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
