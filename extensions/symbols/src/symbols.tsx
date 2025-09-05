import { useState } from "react";
import { SymbolGrid } from "./components/SymbolGrid";
import { allSymbols } from "./data/symbols";
import { usePinnedSymbols } from "./hooks/usePinnedSymbols";
import { useSymbolActions } from "./hooks/useSymbolActions";

export default function SymbolsGrid() {
  const [selectedSymbolName, setSelectedSymbolName] = useState<string | null>(null);
  const { togglePin, isPinned } = usePinnedSymbols();
  const { handleCopySymbol, handleCopyName } = useSymbolActions();

  // Get pinned symbols data
  const pinnedSymbolsData = allSymbols.filter((symbol) => isPinned(symbol.symbol));

  // Get all symbols for selection handling
  const allSymbolsList = [...pinnedSymbolsData, ...allSymbols.filter((s) => !isPinned(s.symbol))];

  const handleSelectionChange = (id: string | null) => {
    const symbol = allSymbolsList.find((s) => s.symbol === id);
    if (symbol) {
      setSelectedSymbolName(symbol.name);
    } else {
      setSelectedSymbolName(null);
    }
  };

  return (
    <SymbolGrid
      symbols={allSymbols}
      pinnedSymbols={pinnedSymbolsData}
      isPinned={isPinned}
      onTogglePin={togglePin}
      onCopySymbol={handleCopySymbol}
      onCopyName={handleCopyName}
      selectedSymbolName={selectedSymbolName}
      onSelectionChange={handleSelectionChange}
    />
  );
}
