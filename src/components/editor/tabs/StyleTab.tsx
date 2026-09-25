'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { cn } from 'cn';
import { Plus, Minus } from 'lucide-react';
import { fontPacks, pageThemes, washiTapes } from '../themes/page-style';
import type { PageStyle } from '../themes/page-style';

interface StyleTabProps {
  editor: Editor;
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
}

const bgColors = [
  '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#ef4444', '#6b7280', '#1a1a1a',
];

export function StyleTab({
  editor,
  documentId,
  title,
  icon,
  coverImage,
  coverType,
  width,
  pageStyle,
  onUpdate,
}: StyleTabProps) {
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const [coverInputOpen, setCoverInputOpen] = useState(false);

  const setPageStyle = (patch: Partial<PageStyle>) => {
    onUpdate({ pageStylePatch: patch });
  };

  return (
    <div className="space-y-5 p-3">
      {/* Color section */}
      <section>
        <h4 className="mb-2 text-caption font-medium uppercase tracking-wider text-foreground/40">颜色</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-ui">背景</span>
            <button
              type="button"
              className="flex size-6 items-center justify-center rounded-md border border-foreground/10 text-foreground/55 transition-colors duration-150 ease-craft hover:bg-foreground/4 hover:text-foreground/85"
              title="添加背景色"
              onClick={() => onUpdate({ coverImage: coverImage ? null : bgColors[0], coverType: coverImage ? 'none' : 'color' })}
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {bgColors.map((color) => (
              <button
                key={color}
                className={cn(
                  'size-6 rounded-md border border-foreground/10 transition-transform hover:scale-110',
                  coverType === 'color' && coverImage === color && 'ring-2 ring-craft-accent'
                )}
                style={{ backgroundColor: color }}
                onClick={() => onUpdate({ coverImage: color, coverType: 'color' })}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-ui">文档颜色</span>
            <button
              type="button"
              className={cn(
                'size-6 rounded-md border border-foreground/10',
                (pageStyle.theme ?? 'default') !== 'default' && 'ring-2 ring-craft-accent'
              )}
              style={{
                backgroundColor: pageThemes.find(t => t.id === pageStyle.theme)?.color || '#fff',
              }}
              title="文档颜色"
              onClick={() => {
                const current = pageStyle.theme ?? 'default';
                const index = pageThemes.findIndex((theme) => theme.id === current);
                setPageStyle({ theme: pageThemes[(index + 1) % pageThemes.length].id });
              }}
            />
          </div>
        </div>
      </section>

      {/* Cover section */}
      <section>
        <h4 className="mb-2 text-caption font-medium uppercase tracking-wider text-foreground/40">封面</h4>
        <div className="flex items-center justify-between">
          <span className="text-ui">封面图片</span>
          <button
            type="button"
            onClick={() => setCoverInputOpen((open) => !open)}
            className="flex size-6 items-center justify-center rounded-md border border-foreground/10 text-foreground/55 transition-colors duration-150 ease-craft hover:bg-foreground/4 hover:text-foreground/85"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        {coverInputOpen && (
          <div className="mt-2 flex gap-1.5">
            <input
              value={coverUrlInput}
              onChange={(event) => setCoverUrlInput(event.target.value)}
              placeholder="粘贴封面图片地址"
              className="min-w-0 flex-1 rounded-md border border-foreground/10 bg-background px-2 py-1 text-meta outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            <button
              type="button"
              onClick={() => {
                if (!coverUrlInput.trim()) return;
                onUpdate({ coverImage: coverUrlInput.trim(), coverType: 'image' });
                setCoverUrlInput('');
                setCoverInputOpen(false);
              }}
              className="rounded-lg bg-craft-accent px-2.5 py-1 text-ui text-white transition-colors duration-150 ease-craft hover:bg-craft-accent-hover"
            >添加</button>
          </div>
        )}
        {coverImage && (
          <button
            type="button"
            onClick={() => onUpdate({ coverImage: null, coverType: 'none' })}
            className="mt-1 flex items-center gap-1 text-meta text-destructive transition-colors hover:underline"
          >
            <Minus className="size-3" /> 移除封面
          </button>
        )}
      </section>

      {/* Page theme colors */}
      <section>
        <h4 className="mb-2 text-caption font-medium uppercase tracking-wider text-foreground/40">页面色调</h4>
        <div className="grid grid-cols-6 gap-1.5">
          {pageThemes.map((theme) => (
            <button
              key={theme.id}
              title={theme.label}
              className={cn(
                'flex size-7 items-center justify-center rounded-md border border-foreground/10 transition-transform hover:scale-110',
                (pageStyle.theme ?? 'default') === theme.id && 'ring-2 ring-craft-accent'
              )}
              style={{
                backgroundColor: theme.color === 'transparent' ? undefined : theme.color,
                backgroundImage:
                  theme.color === 'transparent'
                    ? 'repeating-conic-gradient(var(--checker-a) 0% 25%, var(--checker-b) 0% 50%)'
                    : undefined,
                backgroundSize: theme.color === 'transparent' ? '6px 6px' : undefined,
              }}
              onClick={() => setPageStyle({ theme: theme.id })}
            />
          ))}
        </div>
      </section>

      {/* Font */}
      <section>
        <h4 className="mb-2 text-caption font-medium uppercase tracking-wider text-foreground/40">字体</h4>
        <div className="flex gap-1.5">
          {fontPacks.map((font) => (
            <button
              key={font.id}
              type="button"
              className={cn(
                'flex-1 rounded-lg border border-foreground/10 px-2 py-1.5 text-meta transition-colors duration-150 ease-craft hover:bg-foreground/4',
                (pageStyle.fontPack ?? 'inter') === font.id && 'border-craft-accent bg-craft-accent/12 text-craft-accent'
              )}
              style={{ fontFamily: font.stack }}
              onClick={() => setPageStyle({ fontPack: font.id })}
            >
              {font.label}
            </button>
          ))}
        </div>
      </section>

      {/* Washi */}
      <section>
        <h4 className="mb-2 text-caption font-medium uppercase tracking-wider text-foreground/40">Washi 胶带</h4>
        <div className="grid grid-cols-5 gap-1.5">
          {washiTapes.map((tape) => (
            <button
              key={tape.id}
              title={tape.label}
              className={cn(
                'h-5 rounded-sm border border-foreground/10 transition-transform hover:scale-110',
                (pageStyle.washi ?? 'none') === tape.id && 'ring-2 ring-craft-accent'
              )}
              style={{
                background:
                  tape.gradient || 'repeating-conic-gradient(var(--checker-a) 0% 25%, var(--checker-b) 0% 50%) 6px',
              }}
              onClick={() => setPageStyle({ washi: tape.id })}
            />
          ))}
        </div>
      </section>

      {/* Advanced: width toggle */}
      <section>
        <h4 className="mb-2 text-caption font-medium uppercase tracking-wider text-foreground/40">高级</h4>
        <div className="flex items-center justify-between">
          <span className="text-ui">宽页</span>
          <button
            type="button"
            onClick={() => onUpdate({ width: width === 'wide' ? 'default' : 'wide' })}
            className={cn(
              'relative h-5 w-9 rounded-full transition-colors',
              width === 'wide' ? 'bg-craft-accent' : 'bg-foreground/15'
            )}
          >
            <span
              className={cn(
                'absolute left-0.5 top-0.5 size-4 rounded-full bg-background shadow-sm transition-transform',
                width === 'wide' && 'translate-x-4'
              )}
            />
          </button>
        </div>
      </section>
    </div>
  );
}
