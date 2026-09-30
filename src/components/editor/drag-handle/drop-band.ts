export type RowBox = { top: number; bottom: number };
export type DropTarget = { index: number; before: boolean };

/**
 * Rows are hit as `[top, nextTop)` — the gutter under a row belongs to it — and a
 * drop above the first row clamps to the front, while one below the last row's
 * trailing gutter has no slot at all.
 */
export function dropTargetFor(clientY: number, rows: RowBox[]): DropTarget | null {
  if (rows.length === 0) return null;
  if (clientY < rows[0].top) return { index: 0, before: true };

  const last = rows[rows.length - 1];
  const pitch = rows.length > 1 ? rows[1].top - rows[0].top : last.bottom - last.top;
  const trailingGutter = Math.max(0, pitch - (last.bottom - last.top));

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const bandEnd = index + 1 < rows.length ? rows[index + 1].top : row.bottom + trailingGutter;
    if (clientY >= bandEnd) continue;
    return { index, before: clientY <= row.top + (row.bottom - row.top) / 2 };
  }

  return null;
}
