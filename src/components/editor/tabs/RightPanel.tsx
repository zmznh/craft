'use client';

import { cn } from 'cn';
import { X } from 'lucide-react';
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
  onUpdate,
}: RightPanelProps) {
  return (
    <aside
      className="absolute inset-y-0 right-0 z-30 flex w-[300px] max-w-[85vw] flex-col border-l border-border bg-background shadow-lg md:static md:z-auto md:w-[300px] md:max-w-none md:shadow-none"
      aria-label="编辑器工具面板"
    >
      {/* Tab bar */}
      <div className="flex items-center border-b border-border" role="tablist" aria-label="编辑器工具">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`editor-panel-${tab.id}`}
            id={`editor-tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 px-1 py-2.5 text-ui font-medium text-foreground/40 transition-colors duration-150 ease-craft',
              'hover:bg-foreground/4 hover:text-foreground/85',
              activeTab === tab.id && 'text-foreground/85'
            )}
          >
            {tab.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭编辑器工具面板"
          className="rounded-md px-2 py-2.5 text-foreground/40 transition-colors duration-150 ease-craft hover:bg-foreground/4 hover:text-foreground/85"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Tab content */}
      <div
        className="flex-1 overflow-y-auto"
        role="tabpanel"
        id={`editor-panel-${activeTab}`}
        aria-labelledby={`editor-tab-${activeTab}`}
      >
        {!editor ? (
          <div className="p-4 text-ui text-foreground/40">加载中...</div>
        ) : (
          <>
            {activeTab === 'insert' && <InsertTab editor={editor} />}
            {activeTab === 'format' && <FormatTab editor={editor} />}
            {activeTab === 'style' && (
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
            {activeTab === 'info' && (
              <InfoTab documentId={documentId} editor={editor} wordCount={wordCount} onClose={onClose} />
            )}
          </>
        )}
      </div>
    </aside>
  );
}
