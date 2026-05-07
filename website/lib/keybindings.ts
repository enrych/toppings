import { HOME } from "@/components/reclaim/reclaim.data";

export function keybindingRowIndexByKey(
  rows: typeof HOME.KEYBINDINGS.ROWS = HOME.KEYBINDINGS.ROWS,
): Record<string, number> {
  const map: Record<string, number> = {};
  rows.forEach((row, i) => {
    for (const key of row.combo) {
      map[key.toLowerCase()] = i;
    }
  });
  return map;
}

export const KEYBINDING_ROW_INDEX_BY_KEY = keybindingRowIndexByKey();
