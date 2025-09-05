import { Grid } from "@vicinae/api";
import { SYMBOL_CATEGORIES } from "../data/categories";
import type { SymbolData } from "../types/symbol";
import { getSymbolsByCategory } from "../utils/symbolHelpers";
import { SymbolSection } from "./SymbolSection";

interface SymbolGridProps {
  symbols: SymbolData[];
  pinnedSymbols: SymbolData[];
  isPinned: (symbol: string) => boolean;
  onTogglePin: (symbol: string) => void;
  onCopySymbol: (symbol: string, name: string) => void;
  onCopyName: (name: string) => void;
  selectedSymbolName: string | null;
  onSelectionChange: (id: string | null) => void;
}

export function SymbolGrid({
  symbols,
  pinnedSymbols,
  isPinned,
  onTogglePin,
  onCopySymbol,
  onCopyName,
  selectedSymbolName,
  onSelectionChange,
}: SymbolGridProps) {
  return (
    <Grid
      searchBarPlaceholder="Search symbols..."
      columns={6}
      aspectRatio="1"
      inset={Grid.Inset.Small}
      navigationTitle={selectedSymbolName ? `Symbols - ${selectedSymbolName}` : "Symbols"}
      onSelectionChange={onSelectionChange}
    >
      {/* Pinned Section */}
      {pinnedSymbols.length > 0 && (
        <SymbolSection
          title="Pinned"
          symbols={pinnedSymbols}
          isPinned={isPinned}
          onTogglePin={onTogglePin}
          onCopySymbol={onCopySymbol}
          onCopyName={onCopyName}
          keyPrefix="pinned-"
        />
      )}

      {/* Category Sections */}
      {SYMBOL_CATEGORIES.map(({ key, title }) => {
        const categorySymbols = getSymbolsByCategory(
          symbols,
          key,
          pinnedSymbols.map((s) => s.symbol)
        );
        return (
          <SymbolSection
            key={key}
            title={title}
            symbols={categorySymbols}
            isPinned={isPinned}
            onTogglePin={onTogglePin}
            onCopySymbol={onCopySymbol}
            onCopyName={onCopyName}
          />
        );
      })}
    </Grid>
  );
}
