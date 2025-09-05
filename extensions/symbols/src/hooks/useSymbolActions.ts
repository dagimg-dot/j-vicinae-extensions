import { showToast } from "@vicinae/api";

export function useSymbolActions() {
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

  return {
    handleCopySymbol,
    handleCopyName,
  };
}
