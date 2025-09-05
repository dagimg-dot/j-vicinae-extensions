import type { SymbolCategory, SymbolData } from "../types/symbol";

/**
 * Groups symbols by their category
 * @param symbols - Array of symbols to group
 * @returns Object with category as key and symbols array as value
 */
export function groupSymbolsByCategory(
  symbols: SymbolData[]
): Record<SymbolCategory, SymbolData[]> {
  return symbols.reduce(
    (acc, symbol) => {
      if (!acc[symbol.category]) {
        acc[symbol.category] = [];
      }
      acc[symbol.category].push(symbol);
      return acc;
    },
    {} as Record<SymbolCategory, SymbolData[]>
  );
}

/**
 * Filters symbols by category and excludes pinned ones
 * @param symbols - Array of symbols to filter
 * @param category - Category to filter by
 * @param pinnedSymbols - Array of pinned symbol strings
 * @returns Filtered symbols array
 */
export function getSymbolsByCategory(
  symbols: SymbolData[],
  category: SymbolCategory,
  pinnedSymbols: string[] = []
): SymbolData[] {
  return symbols.filter(
    (symbol) => symbol.category === category && !pinnedSymbols.includes(symbol.symbol)
  );
}

/**
 * Gets all symbols in a single flat array
 * @param symbols - Array of symbols
 * @returns Flat array of all symbols
 */
export function getAllSymbols(symbols: SymbolData[]): SymbolData[] {
  return symbols;
}
