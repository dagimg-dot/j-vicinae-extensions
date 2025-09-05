export type SymbolCategory = "common" | "math" | "currency" | "arrows";

export interface SymbolData {
  symbol: string;
  name: string;
  category: SymbolCategory;
  keywords: string[];
}

export interface SymbolRenderOptions {
  size?: number;
  scale?: number;
  color?: string;
  backgroundColor?: string;
}
