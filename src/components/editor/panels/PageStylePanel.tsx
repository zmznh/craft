'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Image as ImageIcon, Trash2, Link2, Palette } from 'lucide-react';
import { useState } from 'react';
import { cn } from 'cn';
import { updateDocument } from '@/actions/document/update';
import { fontPacks, pageThemes, washiTapes } from '../themes/page-style';
import type { PageStyle } from '../themes/page-style';

interface PageStylePanelProps {
  documentId: string;
  title: string;
  icon: string | null;
  coverImage: string | null;
  coverType: string | null;
  width: string | null;
  pageStyle: PageStyle;
  onUpdate: (data: {
    title?: string;
    icon?: string | null;
    coverImage?: string | null;
    coverType?: string | null;
    width?: string | null;
    pageStylePatch?: Partial<PageStyle>;
  }) => void;
  onClose: () => void;
}

const coverColors = [
  '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#ef4444', '#6b7280', '#1a1a1a',
];

const widthOptions = [
  { value: 'narrow', label: '窄' },
  { value: 'default', label: '默认' },
  { value: 'wide', label: '宽' },
];

export function PageStylePanel({
  documentId,
  title,
  icon,
  coverImage,
  coverType,
  width,
  pageStyle,
  onUpdate,
  onClose,
}: PageStylePanelProps) {
  const [coverUrlInput, setCoverUrlInput] = useState('');

  const setPageStyle = (patch: Partial<PageStyle>) => {
    onUpdate({ pageStylePatch: patch });
  };

  const setCoverUrl = async () => {
    if (!coverUrlInput.trim()) return;
    onUpdate({
      coverImage: coverUrlInput.trim(),
      coverType: 'image',
    });
    setCoverUrlInput('');
  };

  const setCoverColor = async (color: string) => {
    onUpdate({
      coverImage: color,
      coverType: 'color',
    });
  };

  const removeCover = async () => {
    onUpdate({ coverImage: null, coverType: 'none' });
  };

  const setIcon = async () => {
    const emoji = prompt('输入 Emoji 作为文档图标');
    if (emoji) onUpdate({ icon: emoji });
  };

  const setWidth = async (w: string) => {
    onUpdate({ width: w });
  };

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-sm font-medium">页面样式</span>
        <button
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-3">
        {/* 标题 */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">标题</h3>
          <Input
            type="text"
            defaultValue={title}
            onBlur={(e) => {
              if (e.target.value !== title) onUpdate({ title: e.target.value });
            }}
            placeholder="无标题"
          />
        </section>

        {/* 图标 */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">图标</h3>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-md border border-border text-2xl">
              {icon || '📄'}
            </div>
            <Button variant="outline" size="sm" onClick={setIcon}>
              更换
            </Button>
          </div>
        </section>

        {/* 封面 */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">封面</h3>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={coverUrlInput}
              onChange={(e) => setCoverUrlInput(e.target.value)}
              placeholder="图片 URL"
              onKeyDown={(e) => {
                if (e.key === 'Enter') setCoverUrl();
              }}
            />
            <Button variant="outline" size="sm" onClick={setCoverUrl}>
              <Link2 className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {coverColors.map((color) => (
              <button
                key={color}
                className={cn(
                  'size-6 rounded border border-border transition-transform hover:scale-110',
                  coverType === 'color' && coverImage === color && 'ring-2 ring-accent'
                )}
                style={{ backgroundColor: color }}
                onClick={() => setCoverColor(color)}
              />
            ))}
          </div>
          {coverImage && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-destructive"
              onClick={removeCover}
            >
              <Trash2 className="mr-2 size-4" />
              移除封面
            </Button>
          )}
        </section>

        {/* 页面宽度 */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">页面宽度</h3>
          <div className="flex gap-1.5">
            {widthOptions.map((opt) => (
              <button
                key={opt.value}
                className={cn(
                  'flex-1 rounded-md border border-border px-2 py-1.5 text-xs transition-colors hover:bg-muted',
                  (width ?? 'default') === opt.value && 'border-accent bg-accent/10 text-accent'
                )}
                onClick={() => setWidth(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* 字体包 */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">字体</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {fontPacks.map((font) => (
              <button
                key={font.id}
                className={cn(
                  'rounded-md border border-border px-2 py-1.5 text-xs transition-colors hover:bg-muted',
                  (pageStyle.fontPack ?? 'inter') === font.id && 'border-accent bg-accent/10 text-accent'
                )}
                style={{ fontFamily: font.stack }}
                onClick={() => setPageStyle({ fontPack: font.id })}
              >
                {font.label}
              </button>
            ))}
          </div>
        </section>

        {/* 页面主题 */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">页面色调</h3>
          <div className="grid grid-cols-6 gap-1.5">
            {pageThemes.map((theme) => (
              <button
                key={theme.id}
                title={theme.label}
                className={cn(
                  'flex size-8 items-center justify-center rounded-md border border-border transition-transform hover:scale-110',
                  (pageStyle.theme ?? 'default') === theme.id && 'ring-2 ring-accent'
                )}
                style={{
                  backgroundColor: theme.color === 'transparent' ? undefined : theme.color,
                  backgroundImage:
                    theme.color === 'transparent'
                      ? 'repeating-conic-gradient(#e5e5e5 0% 25%, #fff 0% 50%)'
                      : undefined,
                  backgroundSize: theme.color === 'transparent' ? '8px 8px' : undefined,
                }}
                onClick={() => setPageStyle({ theme: theme.id })}
              />
            ))}
          </div>
        </section>

        {/* Washi 胶带 */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">Washi 胶带</h3>
          <div className="grid grid-cols-5 gap-1.5">
            {washiTapes.map((tape) => (
              <button
                key={tape.id}
                title={tape.label}
                className={cn(
                  'h-6 rounded-sm border border-border transition-transform hover:scale-110',
                  (pageStyle.washi ?? 'none') === tape.id && 'ring-2 ring-accent'
                )}
                style={{
                  background:
                    tape.gradient || 'repeating-conic-gradient(#e5e5e5 0% 25%, #fff 0% 50%) 8px',
                }}
                onClick={() => setPageStyle({ washi: tape.id })}
              />
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
