import type { SymbolData } from "../../types/symbol";
import { arrowSymbols } from "./arrows";
import { commonSymbols } from "./common";
import { currencySymbols } from "./currency";
import { mathSymbols } from "./math";

export const allSymbols: SymbolData[] = [
  ...commonSymbols,
  ...mathSymbols,
  ...currencySymbols,
  ...arrowSymbols,
];

export { commonSymbols, mathSymbols, currencySymbols, arrowSymbols };
