'use client';

import { useRef, useState } from 'react';
import { updateDocument } from '@/actions/document/update';
import { Editor, type SaveState } from './Editor';
import { EditorHeader } from './EditorHeader';
import { RightPanel, type RightTabId } from './tabs/RightPanel';
import { Breadcrumb } from './Breadcrumb';
import { Share2, LayoutGrid, Type, Palette, Info } from 'lucide-react';
import { cn } from 'cn';
import { ShareDialog } from '@/components/share/ShareDialog';
import { normalizePageStyle, getFontStack, getThemeColor, getWashiGradient } from './themes/page-style';
import type { PageStyle } from './themes/page-style';

interface DocumentEditorProps {
  document: {
    id: string;
    title: string;
    icon: string | null;
    coverImage: string | null;
    coverType: string | null;
    width: string | null;
    pageStyle: unknown;
    content: any;
  };
}

export function DocumentEditor({ document: doc }: DocumentEditorProps) {
  const [title, setTitle] = useState(doc.title);
  const [icon, setIcon] = useState(doc.icon);
  const [coverImage, setCoverImage] = useState(doc.coverImage);
  const [coverType, setCoverType] = useState(doc.coverType);
  const [width, setWidth] = useState(doc.width ?? 'default');
  const [pageStyle, setPageStyle] = useState<PageStyle>(() => normalizePageStyle(doc.pageStyle));
  const pageStyleRef = useRef(pageStyle);
  const [activeTab, setActiveTab] = useState<RightTabId | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [editor, setEditor] = useState<import('@tiptap/react').Editor | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [saveNow, setSaveNow] = useState<(() => void) | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const handleTabClick = (tab: RightTabId) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  const handleUpdate = async (data: {
    title?: string;
    icon?: string | null;
    coverImage?: string | null;
    coverType?: string | null;
    width?: string | null;
    pageStylePatch?: Partial<PageStyle>;
  }) => {
    if (data.title !== undefined) setTitle(data.title);
    if (data.icon !== undefined) setIcon(data.icon);
    if (data.coverImage !== undefined) setCoverImage(data.coverImage);
    if (data.coverType !== undefined) setCoverType(data.coverType);
    if (data.width !== undefined) setWidth(data.width ?? 'default');
    const { pageStylePatch, ...rest } = data;
    let pageStyleToSave: PageStyle | undefined;
    if (pageStylePatch !== undefined) {
      pageStyleToSave = { ...pageStyleRef.current, ...pageStylePatch };
      pageStyleRef.current = pageStyleToSave;
      setPageStyle(pageStyleToSave);
    }
    setSaveState('saving');
    try {
      await updateDocument(doc.id, { ...rest, pageStyle: pageStyleToSave });
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const maxWidth = width === 'narrow' ? 'max-w-[580px]' : width === 'wide' ? 'max-w-[900px]' : 'max-w-[720px]';
  const themeColor = getThemeColor(pageStyle.theme);
  const washiGradient = getWashiGradient(pageStyle.washi);

  const isColorCover = coverType === 'color' && coverImage;
  const isImageCover = coverType === 'image' && coverImage;

  return (
    <div className="flex h-full flex-1 overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 顶栏：面包屑 + 右侧 tab 按钮 */}
        <div className="flex h-12 shrink-0 items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Breadcrumb title={title} />
            <span
              role="status"
              aria-live="polite"
              className={cn(
                'shrink-0 text-[11px] transition-colors',
                saveState === 'error' ? 'text-destructive' : 'text-muted-foreground/60'
              )}
            >
              {saveState === 'dirty' && '未保存'}
              {saveState === 'saving' && '保存中...'}
              {saveState === 'saved' && '已保存'}
              {saveState === 'error' && (
                <>
                  保存失败
                  <button type="button" onClick={() => saveNow?.()} className="ml-1 underline underline-offset-2">
                    重试
                  </button>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            {/* Tab toggle buttons */}
            {(['insert', 'format', 'style', 'info'] as const).map((tab) => {
              const icons = { insert: LayoutGrid, format: Type, style: Palette, info: Info };
              const labels = { insert: '插入', format: '格式', style: '样式', info: '信息' };
              const Icon = icons[tab];
              return (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  type="button"
                  aria-label={labels[tab]}
                  aria-pressed={activeTab === tab}
                  title={labels[tab]}
                  className={cn(
                    'rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    activeTab === tab && 'bg-muted text-foreground'
                  )}
                >
                  <Icon className="size-4" />
                </button>
              );
            })}
            <div className="mx-0.5 h-4 w-px bg-border" />
            <button
              onClick={() => setShareOpen(true)}
              type="button"
              aria-label="分享"
              title="分享"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Share2 className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div
            className="relative min-h-full"
            style={{
              backgroundColor: themeColor,
              fontFamily: getFontStack(pageStyle.fontPack),
            }}
          >
            {washiGradient && (
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 z-10 h-5 w-32 -translate-x-1/2 -rotate-2 rounded-b-sm opacity-80 shadow-sm"
                style={{ background: washiGradient }}
              />
            )}
            <div className={cn('mx-auto px-12 pb-32', maxWidth)}>
            {/* 封面 */}
            {isColorCover && (
              <div
                className="mb-6 h-48 w-full rounded-lg"
                style={{ backgroundColor: coverImage! }}
              />
            )}
            {isImageCover && (
              <div className="mb-6 h-48 w-full overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage!} alt="Cover" className="h-full w-full object-cover" />
              </div>
            )}

            <EditorHeader
              documentId={doc.id}
              title={title}
              icon={icon}
              onTitleChange={(t) => handleUpdate({ title: t })}
              onIconChange={(i) => handleUpdate({ icon: i })}
            />
            <Editor
              documentId={doc.id}
              initialContent={doc.content}
              collaborative
              onEditorReady={setEditor}
              onSaveStateChange={setSaveState}
              onSaveNowReady={setSaveNow}
              onUpdate={(_, __, count) => setWordCount(count)}
            />
            </div>
          </div>
        </div>
      </div>

      {/* 右侧栏：统一 4-tab 面板 */}
      {activeTab && (
        <RightPanel
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab((prev) => (prev === tab ? null : tab))}
          onClose={() => setActiveTab(null)}
          editor={editor}
          documentId={doc.id}
          title={title}
          icon={icon}
          coverImage={coverImage}
          coverType={coverType}
          width={width}
          pageStyle={pageStyle}
          wordCount={wordCount}
          onUpdate={handleUpdate}
        />
      )}

      <ShareDialog documentId={doc.id} open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
