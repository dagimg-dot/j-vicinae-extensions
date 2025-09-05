import { Grid } from "@vicinae/api";
import type { SymbolData } from "../types/symbol";
import { SymbolItem } from "./SymbolItem";

interface SymbolSectionProps {
  title: string;
  symbols: SymbolData[];
  isPinned: (symbol: string) => boolean;
  onTogglePin: (symbol: string) => void;
  onCopySymbol: (symbol: string, name: string) => void;
  onCopyName: (name: string) => void;
  keyPrefix?: string;
}

export function SymbolSection({
  title,
  symbols,
  isPinned,
  onTogglePin,
  onCopySymbol,
  onCopyName,
  keyPrefix = "",
}: SymbolSectionProps) {
  if (symbols.length === 0) {
    return null;
  }

  return (
    <Grid.Section title={title} columns={6} aspectRatio="1" inset={Grid.Inset.Small}>
      {symbols.map((symbol) => (
        <SymbolItem
          key={`${keyPrefix}${symbol.symbol}`}
          symbol={symbol}
          isPinned={isPinned(symbol.symbol)}
          onTogglePin={onTogglePin}
          onCopySymbol={onCopySymbol}
          onCopyName={onCopyName}
          keyPrefix={keyPrefix}
        />
      ))}
    </Grid.Section>
  );
}
