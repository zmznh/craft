'use client';

import { cn } from 'cn';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useIsCompact } from '@/lib/use-is-mobile';
import { InsertTab } from './InsertTab';
import { FormatTab } from './FormatTab';
import { StyleTab } from './StyleTab';
import { InfoTab } from './InfoTab';
import type { Editor } from '@tiptap/react';
import type { PageStyle } from '../themes/page-style';

export type RightTabId = 'insert' | 'format' | 'style' | 'info';

const tabs: { id: RightTabId; label: string }[] = [
  { id: 'insert', label: '插入' },
  { id: 'format', label: '格式' },
  { id: 'style', label: '样式' },
  { id: 'info', label: '信息' },
];

interface RightPanelProps {
  /** Controls the compact bottom sheet; the desktop rail mounts only while open.
      Keeping the sheet mounted and flipping this avoids racing a menu's own dismiss. */
  open: boolean;
  activeTab: RightTabId;
  onTabChange: (tab: RightTabId) => void;
  onClose: () => void;
  editor: Editor | null;
  documentId: string;
  title: string;
  icon: string | null;
  coverImage: string | null;
  coverType: string | null;
  width: string | null;
  pageStyle: PageStyle;
  wordCount: number;
  /** Only the owner manages collaborators, and only editors see the styling tabs. */
  isOwner: boolean;
  canEdit: boolean;
  onUpdate: (data: {
    title?: string;
    icon?: string | null;
    coverImage?: string | null;
    coverType?: string | null;
    width?: string | null;
    pageStylePatch?: Partial<PageStyle>;
  }) => void;
}

export function RightPanel({
  open,
  activeTab,
  onTabChange,
  onClose,
  editor,
  documentId,
  title,
  icon,
  coverImage,
  coverType,
  width,
  pageStyle,
  wordCount,
  isOwner,
  canEdit,
  onUpdate,
}: RightPanelProps) {
  const isCompact = useIsCompact();
  const visibleTabs = canEdit ? tabs : tabs.filter((tab) => tab.id === 'info');
  const visibleActiveTab = visibleTabs.some((tab) => tab.id === activeTab) ? activeTab : 'info';

  const body = (
    <>
      {/* Tab bar */}
      <div className="flex shrink-0 items-center border-b border-border" role="tablist" aria-label="编辑器工具">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={visibleActiveTab === tab.id}
            aria-controls={`editor-panel-${tab.id}`}
            id={`editor-tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 px-1 py-2.5 text-xs font-medium text-muted-foreground transition-colors',
              'hover:text-foreground',
              visibleActiveTab === tab.id && 'text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭编辑器工具面板"
          className="px-2 py-2.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Tab content */}
      <div
        className="min-h-0 flex-1 overflow-y-auto"
        role="tabpanel"
        id={`editor-panel-${visibleActiveTab}`}
        aria-labelledby={`editor-tab-${visibleActiveTab}`}
      >
        {!editor ? (
          <div className="p-4 text-xs text-muted-foreground">加载中...</div>
        ) : (
          <>
            {visibleActiveTab === 'insert' && <InsertTab editor={editor} />}
            {visibleActiveTab === 'format' && <FormatTab editor={editor} />}
            {visibleActiveTab === 'style' && (
              <StyleTab
                editor={editor}
                documentId={documentId}
                title={title}
                icon={icon}
                coverImage={coverImage}
                coverType={coverType}
                width={width}
                pageStyle={pageStyle}
                onUpdate={onUpdate}
              />
            )}
            {visibleActiveTab === 'info' && (
              <InfoTab
                documentId={documentId}
                editor={editor}
                wordCount={wordCount}
                isOwner={isOwner}
                onClose={onClose}
              />
            )}
          </>
        )}
      </div>
    </>
  );

  // Tablets and phones have no horizontal room left of the editor, so the same
  // four tabs arrive as a bottom sheet instead.
  if (isCompact) {
    return (
      <Sheet open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
        <SheetContent side="bottom" className="h-[60dvh] max-h-[60dvh] gap-0 p-0">
          <SheetTitle className="sr-only">编辑器工具</SheetTitle>
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className="flex h-full w-[var(--panel-w)] shrink-0 flex-col border-l border-border bg-background"
      aria-label="编辑器工具面板"
    >
      {body}
    </aside>
  );
}
