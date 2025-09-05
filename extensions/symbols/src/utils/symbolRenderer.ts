import type { SymbolRenderOptions } from "../types/symbol";

const DEFAULT_OPTIONS: Required<SymbolRenderOptions> = {
  size: 16,
  scale: 0.5,
  color: "white",
  backgroundColor: "transparent",
};

/**
 * Generates a URL for rendering a symbol using math.vercel.app
 * @param symbol - The symbol to render
 * @param options - Optional rendering parameters
 * @returns The complete URL for the symbol image
 */
export function getSymbolImageUrl(symbol: string, options: SymbolRenderOptions = {}): string {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const params = new URLSearchParams({
    inline: `⠀${symbol}⠀`,
    color: config.color,
    backgroundColor: config.backgroundColor,
    size: config.size.toString(),
    scale: config.scale.toString(),
  });

  return `https://math.vercel.app?${params.toString()}`;
}
