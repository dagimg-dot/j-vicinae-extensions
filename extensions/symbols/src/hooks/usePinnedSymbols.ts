import { LocalStorage } from "@vicinae/api";
import { useEffect, useState } from "react";

const PINNED_SYMBOLS_KEY = "symbols-pinned";

export function usePinnedSymbols() {
  const [pinnedSymbols, setPinnedSymbols] = useState<string[]>([]);

  // Load pinned symbols from LocalStorage on mount
  useEffect(() => {
    const loadPinnedSymbols = async () => {
      try {
        const saved = await LocalStorage.getItem<string>(PINNED_SYMBOLS_KEY);
        if (saved) {
          setPinnedSymbols(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load pinned symbols:", e);
      }
    };
    loadPinnedSymbols();
  }, []);

  // Save pinned symbols to LocalStorage whenever it changes
  useEffect(() => {
    const savePinnedSymbols = async () => {
      try {
        await LocalStorage.setItem(PINNED_SYMBOLS_KEY, JSON.stringify(pinnedSymbols));
      } catch (e) {
        console.error("Failed to save pinned symbols:", e);
      }
    };
    if (pinnedSymbols.length > 0) {
      savePinnedSymbols();
    }
  }, [pinnedSymbols]);

  const togglePin = (symbol: string) => {
    setPinnedSymbols((prev) => {
      if (prev.includes(symbol)) {
        return prev.filter((s) => s !== symbol);
      } else {
        return [...prev, symbol];
      }
    });
  };

  const isPinned = (symbol: string) => pinnedSymbols.includes(symbol);

  return {
    pinnedSymbols,
    togglePin,
    isPinned,
  };
}
