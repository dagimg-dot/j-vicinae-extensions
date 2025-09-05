import { Action, ActionPanel, Grid, Icon, LocalStorage, showToast } from "@vicinae/api";
import { useEffect, useState } from "react";

export default function SymbolsGrid() {
  const [pinnedSymbols, setPinnedSymbols] = useState<string[]>([]);
  const [selectedSymbolName, setSelectedSymbolName] = useState<string | null>(null);

  // Load pinned symbols from LocalStorage on mount
  useEffect(() => {
    const loadPinnedSymbols = async () => {
      try {
        const saved = await LocalStorage.getItem<string>("symbols-pinned");
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
        await LocalStorage.setItem("symbols-pinned", JSON.stringify(pinnedSymbols));
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

  const handleCopySymbol = async (symbol: string, name: string) => {
    await showToast({
      title: `Copied ${name}`,
      message: `Symbol: ${symbol}`,
    });
  };

  const handleCopyName = async (name: string) => {
    await showToast({
      title: `Copied name`,
      message: `Name: ${name}`,
    });
  };

  // Get pinned symbols data
  const pinnedSymbolsData = symbols.filter((symbol) => isPinned(symbol.symbol));

  // Get all symbols for selection handling
  const allSymbols = [...pinnedSymbolsData, ...symbols.filter((s) => !isPinned(s.symbol))];

  return (
    <Grid
      searchBarPlaceholder="Search symbols..."
      columns={6}
      aspectRatio="1"
      inset={Grid.Inset.Small}
      navigationTitle={selectedSymbolName ? `Symbols - ${selectedSymbolName}` : "Symbols"}
      onSelectionChange={(id) => {
        const symbol = allSymbols.find((s) => s.symbol === id);
        if (symbol) {
          setSelectedSymbolName(symbol.name);
        }
      }}
    >
      {/* Pinned Section */}
      {pinnedSymbolsData.length > 0 && (
        <Grid.Section title="Pinned" columns={6} aspectRatio="1" inset={Grid.Inset.Small}>
          {pinnedSymbolsData.map((symbol) => (
            <Grid.Item
              key={`pinned-${symbol.symbol}`}
              id={symbol.symbol}
              content={{
                source: `https://math.vercel.app?inline=${`⠀${symbol.symbol}⠀`}&color=white&backgroundColor=transparent&size=16&scale=0.5`,
                tooltip: symbol.name,
              }}
              keywords={symbol.keywords}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard
                    title="Copy Symbol"
                    content={symbol.symbol}
                    onCopy={() => handleCopySymbol(symbol.symbol, symbol.name)}
                    shortcut={{ modifiers: ["cmd"], key: "enter" }}
                  />
                  <Action.CopyToClipboard
                    title="Copy Symbol Name"
                    content={symbol.name}
                    onCopy={() => handleCopyName(symbol.name)}
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                  />
                  <Action
                    title="Unpin Symbol"
                    icon={Icon.Pin}
                    onAction={() => togglePin(symbol.symbol)}
                    shortcut={{ modifiers: ["cmd"], key: "p" }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </Grid.Section>
      )}

      {/* Common Symbols */}
      <Grid.Section title="Common" columns={6} aspectRatio="1" inset={Grid.Inset.Small}>
        {symbols
          .filter((symbol) => symbol.category === "common" && !isPinned(symbol.symbol))
          .map((symbol) => (
            <Grid.Item
              key={symbol.symbol}
              id={symbol.symbol}
              content={{
                source: `https://math.vercel.app?inline=${`⠀${symbol.symbol}⠀`}&color=white&backgroundColor=transparent&size=16&scale=0.5`,
                tooltip: symbol.name,
              }}
              keywords={symbol.keywords}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard
                    title="Copy Symbol"
                    content={symbol.symbol}
                    onCopy={() => handleCopySymbol(symbol.symbol, symbol.name)}
                    shortcut={{ modifiers: ["cmd"], key: "enter" }}
                  />
                  <Action.CopyToClipboard
                    title="Copy Symbol Name"
                    content={symbol.name}
                    onCopy={() => handleCopyName(symbol.name)}
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                  />
                  <Action
                    title="Pin Symbol"
                    icon={Icon.Pin}
                    onAction={() => togglePin(symbol.symbol)}
                    shortcut={{ modifiers: ["cmd"], key: "p" }}
                  />
                </ActionPanel>
              }
            />
          ))}
      </Grid.Section>

      {/* Math Symbols */}
      <Grid.Section title="Math" columns={6} aspectRatio="1" inset={Grid.Inset.Small}>
        {symbols
          .filter((symbol) => symbol.category === "math" && !isPinned(symbol.symbol))
          .map((symbol) => (
            <Grid.Item
              key={symbol.symbol}
              id={symbol.symbol}
              content={{
                source: `https://math.vercel.app?inline=${`⠀${symbol.symbol}⠀`}&color=white&backgroundColor=transparent&size=16&scale=0.5`,
                tooltip: symbol.name,
              }}
              keywords={symbol.keywords}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard
                    title="Copy Symbol"
                    content={symbol.symbol}
                    onCopy={() => handleCopySymbol(symbol.symbol, symbol.name)}
                    shortcut={{ modifiers: ["cmd"], key: "enter" }}
                  />
                  <Action.CopyToClipboard
                    title="Copy Symbol Name"
                    content={symbol.name}
                    onCopy={() => handleCopyName(symbol.name)}
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                  />
                  <Action
                    title="Pin Symbol"
                    icon={Icon.Pin}
                    onAction={() => togglePin(symbol.symbol)}
                    shortcut={{ modifiers: ["cmd"], key: "p" }}
                  />
                </ActionPanel>
              }
            />
          ))}
      </Grid.Section>

      {/* Currency Symbols */}
      <Grid.Section title="Currency" columns={6} aspectRatio="1" inset={Grid.Inset.Small}>
        {symbols
          .filter((symbol) => symbol.category === "currency" && !isPinned(symbol.symbol))
          .map((symbol) => (
            <Grid.Item
              key={symbol.symbol}
              id={symbol.symbol}
              content={{
                source: `https://math.vercel.app?inline=${`⠀${symbol.symbol}⠀`}&color=white&backgroundColor=transparent&size=16&scale=0.5`,
                tooltip: symbol.name,
              }}
              keywords={symbol.keywords}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard
                    title="Copy Symbol"
                    content={symbol.symbol}
                    onCopy={() => handleCopySymbol(symbol.symbol, symbol.name)}
                    shortcut={{ modifiers: ["cmd"], key: "enter" }}
                  />
                  <Action.CopyToClipboard
                    title="Copy Symbol Name"
                    content={symbol.name}
                    onCopy={() => handleCopyName(symbol.name)}
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                  />
                  <Action
                    title="Pin Symbol"
                    icon={Icon.Pin}
                    onAction={() => togglePin(symbol.symbol)}
                    shortcut={{ modifiers: ["cmd"], key: "p" }}
                  />
                </ActionPanel>
              }
            />
          ))}
      </Grid.Section>

      {/* Arrows */}
      <Grid.Section title="Arrows" columns={6} aspectRatio="1" inset={Grid.Inset.Small}>
        {symbols
          .filter((symbol) => symbol.category === "arrows" && !isPinned(symbol.symbol))
          .map((symbol) => (
            <Grid.Item
              key={symbol.symbol}
              id={symbol.symbol}
              content={{
                source: `https://math.vercel.app?inline=${`⠀${symbol.symbol}⠀`}&color=white&backgroundColor=transparent&size=16&scale=0.5`,
                tooltip: symbol.name,
              }}
              keywords={symbol.keywords}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard
                    title="Copy Symbol"
                    content={symbol.symbol}
                    onCopy={() => handleCopySymbol(symbol.symbol, symbol.name)}
                    shortcut={{ modifiers: ["cmd"], key: "enter" }}
                  />
                  <Action.CopyToClipboard
                    title="Copy Symbol Name"
                    content={symbol.name}
                    onCopy={() => handleCopyName(symbol.name)}
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                  />
                  <Action
                    title="Pin Symbol"
                    icon={Icon.Pin}
                    onAction={() => togglePin(symbol.symbol)}
                    shortcut={{ modifiers: ["cmd"], key: "p" }}
                  />
                </ActionPanel>
              }
            />
          ))}
      </Grid.Section>
    </Grid>
  );
}

type Symbol = {
  symbol: string;
  name: string;
  category: "common" | "math" | "currency" | "arrows";
  keywords: string[];
};

const symbols: Symbol[] = [
  // Common Symbols (5)
  {
    symbol: "©",
    name: "Copyright",
    category: "common",
    keywords: ["copyright", "c", "symbol", "legal", "rights", "author"],
  },
  {
    symbol: "®",
    name: "Registered Trademark",
    category: "common",
    keywords: ["registered", "trademark", "r", "symbol", "legal", "brand"],
  },
  {
    symbol: "™",
    name: "Trademark",
    category: "common",
    keywords: ["trademark", "tm", "symbol", "brand", "mark"],
  },
  {
    symbol: "—",
    name: "Em Dash",
    category: "common",
    keywords: ["em", "dash", "long", "hyphen", "punctuation", "break"],
  },
  {
    symbol: "…",
    name: "Ellipsis",
    category: "common",
    keywords: ["ellipsis", "dots", "three", "pause", "omission", "trailing"],
  },

  // Math Symbols (5)
  {
    symbol: "∑",
    name: "Summation",
    category: "math",
    keywords: ["sum", "sigma", "total", "addition", "series", "math"],
  },
  {
    symbol: "∞",
    name: "Infinity",
    category: "math",
    keywords: ["infinity", "infinite", "unlimited", "forever", "math"],
  },
  {
    symbol: "≤",
    name: "Less Than or Equal",
    category: "math",
    keywords: ["less", "than", "equal", "comparison", "inequality", "math"],
  },
  {
    symbol: "≥",
    name: "Greater Than or Equal",
    category: "math",
    keywords: ["greater", "than", "equal", "comparison", "inequality", "math"],
  },
  {
    symbol: "π",
    name: "Pi",
    category: "math",
    keywords: ["pi", "greek", "letter", "circle", "constant", "math"],
  },

  // Currency Symbols (5)
  {
    symbol: "€",
    name: "Euro",
    category: "currency",
    keywords: ["euro", "europe", "currency", "money", "european"],
  },
  {
    symbol: "£",
    name: "Pound Sterling",
    category: "currency",
    keywords: ["pound", "sterling", "british", "currency", "money", "uk"],
  },
  {
    symbol: "¥",
    name: "Yen",
    category: "currency",
    keywords: ["yen", "japanese", "currency", "money", "japan"],
  },
  {
    symbol: "¢",
    name: "Cent",
    category: "currency",
    keywords: ["cent", "penny", "currency", "money", "us"],
  },
  {
    symbol: "₹",
    name: "Rupee",
    category: "currency",
    keywords: ["rupee", "indian", "currency", "money", "india"],
  },

  // Arrows (5)
  {
    symbol: "→",
    name: "Right Arrow",
    category: "arrows",
    keywords: ["right", "arrow", "direction", "next", "forward"],
  },
  {
    symbol: "←",
    name: "Left Arrow",
    category: "arrows",
    keywords: ["left", "arrow", "direction", "back", "previous"],
  },
  {
    symbol: "↑",
    name: "Up Arrow",
    category: "arrows",
    keywords: ["up", "arrow", "direction", "increase", "top"],
  },
  {
    symbol: "↓",
    name: "Down Arrow",
    category: "arrows",
    keywords: ["down", "arrow", "direction", "decrease", "bottom"],
  },
  {
    symbol: "↔",
    name: "Left-Right Arrow",
    category: "arrows",
    keywords: ["left", "right", "arrow", "bidirectional", "both"],
  },
];
