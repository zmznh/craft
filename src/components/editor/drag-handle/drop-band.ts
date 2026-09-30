export type DropBand = 'none' | 'before' | 'after';

// The exact midline resolves to `before`: a drop lands after a block only when strictly past the middle.
export function dropBandFor(
  clientY: number,
  rect: { top: number; bottom: number; height: number }
): DropBand {
  if (clientY < rect.top || clientY > rect.bottom) return 'none';
  return clientY <= rect.top + rect.height / 2 ? 'before' : 'after';
}
