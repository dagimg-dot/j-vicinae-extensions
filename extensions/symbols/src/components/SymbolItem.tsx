import { Action, ActionPanel, Grid, Icon } from "@vicinae/api";
import type { SymbolData } from "../types/symbol";
import { getSymbolImageUrl } from "../utils/symbolRenderer";

interface SymbolItemProps {
  symbol: SymbolData;
  isPinned: boolean;
  onTogglePin: (symbol: string) => void;
  onCopySymbol: (symbol: string, name: string) => void;
  onCopyName: (name: string) => void;
  keyPrefix?: string;
}

export function SymbolItem({
  symbol,
  isPinned,
  onTogglePin,
  onCopySymbol,
  onCopyName,
  keyPrefix = "",
}: SymbolItemProps) {
  return (
    <Grid.Item
      key={`${keyPrefix}${symbol.symbol}`}
      id={symbol.symbol}
      content={{
        source: getSymbolImageUrl(symbol.symbol),
        tooltip: symbol.name,
      }}
      keywords={symbol.keywords}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Copy Symbol"
            content={symbol.symbol}
            onCopy={() => onCopySymbol(symbol.symbol, symbol.name)}
            shortcut={{ modifiers: ["cmd"], key: "enter" }}
          />
          <Action.CopyToClipboard
            title="Copy Symbol Name"
            content={symbol.name}
            onCopy={() => onCopyName(symbol.name)}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
          <Action
            title={isPinned ? "Unpin Symbol" : "Pin Symbol"}
            icon={Icon.Pin}
            onAction={() => onTogglePin(symbol.symbol)}
            shortcut={{ modifiers: ["cmd"], key: "p" }}
          />
        </ActionPanel>
      }
    />
  );
}
