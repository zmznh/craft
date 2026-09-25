'use client';

import { useCallback, useRef, useState } from 'react';
import { updateDocument } from '@/actions/document/update';
import { Editor, type SaveState } from './Editor';
import { EditorHeader } from './EditorHeader';
import { RightPanel, type RightTabId } from './tabs/RightPanel';
import { Breadcrumb } from './Breadcrumb';
import { Share2, LayoutGrid, Type, Palette, Info, Menu, MoreHorizontal } from 'lucide-react';
import { cn } from 'cn';
import { useIsCompact, useIsMobile } from '@/lib/use-is-mobile';
import { useSidebarStore } from '@/lib/store/use-sidebar-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShareDialog } from '@/components/share/ShareDialog';
import { normalizePageStyle, getFontStack, getThemeColor, getWashiGradient } from './themes/page-style';
import type { PageStyle } from './themes/page-style';

const TAB_ORDER = ['insert', 'format', 'style', 'info'] as const;
const TAB_ICONS = { insert: LayoutGrid, format: Type, style: Palette, info: Info };
const TAB_LABELS: Record<RightTabId, string> = {
  insert: '插入',
  format: '格式',
  style: '样式',
  info: '信息',
};

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
  role?: 'owner' | 'editor' | 'commenter' | 'viewer';
}

export function DocumentEditor({ document: doc, role = 'owner' }: DocumentEditorProps) {
  const canEdit = role === 'owner' || role === 'editor';
  const isOwner = role === 'owner';
  const isMobile = useIsMobile();
  const isCompact = useIsCompact();
  const toggleMobileNav = useSidebarStore((store) => store.toggleMobileNav);
  const bumpTree = useSidebarStore((store) => store.bumpTree);
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
  // The editor hands us its save function on mount. A ref, not state: the editor
  // recreates that function on every render, so storing it in state feeds a
  // setState back into the render that produced it — an update loop.
  const saveNowRef = useRef<(() => void) | null>(null);
  const handleSaveNowReady = useCallback((fn: (() => void) | null) => {
    saveNowRef.current = fn;
  }, []);
  const [wordCount, setWordCount] = useState(0);

  const handleTabClick = (tab: RightTabId) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  const availableTabs = TAB_ORDER.filter((tab) => canEdit || tab === 'info');
  const primaryTabs = isMobile ? availableTabs.filter((tab) => tab === 'insert' || tab === 'format') : availableTabs;
  const overflowTabs = isMobile ? availableTabs.filter((tab) => tab !== 'insert' && tab !== 'format') : [];

  const handleUpdate = async (data: {
    title?: string;
    icon?: string | null;
    coverImage?: string | null;
    coverType?: string | null;
    width?: string | null;
    pageStylePatch?: Partial<PageStyle>;
  }) => {
    if (!canEdit) return;
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
      // The sidebar row shows the same title, so keep it in step with the editor.
      if (data.title !== undefined) bumpTree();
    } catch {
      setSaveState('error');
    }
  };

  const measure = width === 'narrow' ? '580px' : width === 'wide' ? '900px' : '720px';
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
            {isMobile && (
              <button
                type="button"
                onClick={toggleMobileNav}
                aria-label="打开导航"
                className="-ml-1.5 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Menu className="size-4" />
              </button>
            )}
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
                  <button type="button" onClick={() => saveNowRef.current?.()} className="ml-1 underline underline-offset-2">
                    重试
                  </button>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            {/* Tab toggle buttons; phones keep two in the bar and fold the rest away */}
            {primaryTabs.map((tab) => {
              const Icon = TAB_ICONS[tab];
              return (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  type="button"
                  aria-label={TAB_LABELS[tab]}
                  aria-pressed={activeTab === tab}
                  title={TAB_LABELS[tab]}
                  className={cn(
                    'rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    activeTab === tab && 'bg-muted text-foreground'
                  )}
                >
                  <Icon className="size-4" />
                </button>
              );
            })}
            {overflowTabs.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  aria-label="更多面板"
                  title="更多面板"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {overflowTabs.map((tab) => (
                    <DropdownMenuItem key={tab} onClick={() => setActiveTab(tab)}>
                      {TAB_LABELS[tab]}
                    </DropdownMenuItem>
                  ))}
                  {isOwner && (
                    <DropdownMenuItem onClick={() => setShareOpen(true)}>分享</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <div className="mx-0.5 h-4 w-px bg-border" />
            {isOwner && !isMobile && (
              <button
                onClick={() => setShareOpen(true)}
                type="button"
                aria-label="分享"
                title="分享"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Share2 className="size-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
        <div className="relative min-h-full bg-background px-3 py-5 sm:px-8">
          <div
            className="relative mx-auto rounded-2xl px-[var(--editor-pad-x)] pb-32 shadow-doc"
            style={{
              ['--editor-measure' as string]: measure,
              maxWidth: 'var(--editor-max-w, var(--editor-measure))',
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
              readOnly={!canEdit}
              onTitleChange={(t) => handleUpdate({ title: t })}
              onIconChange={(i) => handleUpdate({ icon: i })}
            />
            <Editor
              documentId={doc.id}
              initialContent={doc.content}
              collaborative
              readOnly={!canEdit}
              onEditorReady={setEditor}
              onSaveStateChange={setSaveState}
              onSaveNowReady={handleSaveNowReady}
              onUpdate={(_, __, count) => setWordCount(count)}
            />
            </div>
          </div>
        </div>
      </div>

      {/* 右侧栏：统一 4-tab 面板。紧凑布局下面板常驻挂载，只翻转 open，
          这样从 ⋯ 菜单打开时不会和菜单自身的关闭打架。 */}
      {(isCompact || activeTab) && (
        <RightPanel
          open={!!activeTab}
          activeTab={activeTab ?? 'insert'}
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
          isOwner={isOwner}
          canEdit={canEdit}
          onUpdate={handleUpdate}
        />
      )}

      <ShareDialog documentId={doc.id} open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
