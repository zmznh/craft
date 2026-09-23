'use client';

import { useMemo } from 'react';
import { Editor } from '@/components/editor/Editor';
import { normalizePageStyle, getFontStack, getThemeColor, getWashiGradient } from '@/components/editor/themes/page-style';

interface SharedDocViewProps {
  documentId: string;
  title: string;
  icon: string | null;
  coverImage: string | null;
  coverType: string | null;
  content: any;
  pageStyle?: unknown;
  styled?: boolean;
  header?: React.ReactNode;
}

export function SharedDocView({
  documentId,
  title,
  icon,
  coverImage,
  coverType,
  content,
  pageStyle,
  styled = false,
  header,
}: SharedDocViewProps) {
  const style = useMemo(() => normalizePageStyle(pageStyle), [pageStyle]);
  const isColorCover = coverType === 'color' && coverImage;
  const isImageCover = coverType === 'image' && coverImage;
  const washiGradient = getWashiGradient(style.washi);

  return (
    <div
      className="relative min-h-full"
      style={
        styled
          ? {
              backgroundColor: getThemeColor(style.theme),
              fontFamily: getFontStack(style.fontPack),
            }
          : undefined
      }
    >
      {styled && washiGradient && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 z-10 h-5 w-32 -translate-x-1/2 -rotate-2 rounded-b-sm opacity-80 shadow-sm"
          style={{ background: washiGradient }}
        />
      )}
      <div className="mx-auto max-w-[720px] px-12 pb-32 pt-12">
        {isColorCover && (
          <div className="mb-6 h-48 w-full rounded-lg" style={{ backgroundColor: coverImage! }} />
        )}
        {isImageCover && (
          <div className="mb-6 h-48 w-full overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImage!} alt="Cover" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-md text-2xl">
              {icon || '📄'}
            </span>
            <h1 className="flex-1 font-serif text-3xl font-normal">{title}</h1>
          </div>
        </div>
        <Editor documentId={documentId} initialContent={content} readOnly />
      </div>
      {header}
    </div>
  );
}
