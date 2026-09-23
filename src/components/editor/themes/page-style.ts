export interface PageStyle {
  fontPack?: FontPackId;
  theme?: PageThemeId;
  washi?: WashiId;
}

export type FontPackId = 'inter' | 'serif' | 'mono' | 'rounded';

export type PageThemeId = 'default' | 'cream' | 'mint' | 'sky' | 'lavender' | 'peach';

export type WashiId = 'none' | 'sunset' | 'ocean' | 'forest' | 'candy';

export const fontPacks: { id: FontPackId; label: string; stack: string }[] = [
  { id: 'inter', label: '默认', stack: 'var(--font-sans), system-ui, sans-serif' },
  { id: 'serif', label: '衬线', stack: 'Georgia, "Times New Roman", "Songti SC", serif' },
  { id: 'mono', label: '等宽', stack: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
  { id: 'rounded', label: '圆体', stack: 'ui-rounded, "Hiragino Maru Gothic ProN", Quicksand, sans-serif' },
];

export const pageThemes: { id: PageThemeId; label: string; color: string }[] = [
  { id: 'default', label: '默认', color: 'transparent' },
  { id: 'cream', label: '奶油', color: '#faf6ec' },
  { id: 'mint', label: '薄荷', color: '#ecfaf5' },
  { id: 'sky', label: '晴空', color: '#ecf5fd' },
  { id: 'lavender', label: '薰衣草', color: '#f2effc' },
  { id: 'peach', label: '蜜桃', color: '#fdf0ec' },
];

export const washiTapes: { id: WashiId; label: string; gradient: string }[] = [
  { id: 'none', label: '无', gradient: '' },
  {
    id: 'sunset',
    label: '日落',
    gradient: 'linear-gradient(100deg, #fbbf24, #f472b6, #a78bfa)',
  },
  {
    id: 'ocean',
    label: '海洋',
    gradient: 'linear-gradient(100deg, #22d3ee, #3b82f6, #6366f1)',
  },
  {
    id: 'forest',
    label: '森林',
    gradient: 'linear-gradient(100deg, #4ade80, #14b8a6, #0d9488)',
  },
  {
    id: 'candy',
    label: '糖果',
    gradient: 'linear-gradient(100deg, #f472b6, #c084fc, #818cf8)',
  },
];

export function getFontStack(id: FontPackId | undefined): string {
  return fontPacks.find((f) => f.id === id)?.stack ?? fontPacks[0].stack;
}

export function getThemeColor(id: PageThemeId | undefined): string {
  return pageThemes.find((t) => t.id === id)?.color ?? 'transparent';
}

export function getWashiGradient(id: WashiId | undefined): string {
  return washiTapes.find((w) => w.id === id)?.gradient ?? '';
}

export function normalizePageStyle(value: unknown): PageStyle {
  if (!value || typeof value !== 'object') return {};
  const v = value as Record<string, unknown>;
  return {
    fontPack: typeof v.fontPack === 'string' ? (v.fontPack as FontPackId) : undefined,
    theme: typeof v.theme === 'string' ? (v.theme as PageThemeId) : undefined,
    washi: typeof v.washi === 'string' ? (v.washi as WashiId) : undefined,
  };
}
