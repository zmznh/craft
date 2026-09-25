'use client';

import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  CheckSquare, ChevronRight, AlignLeft, AlignCenter, AlignRight,
  Indent, Outdent, Eye, Square,
} from 'lucide-react';
import { cn } from 'cn';

interface FormatTabProps {
  editor: Editor;
}

const textStyles = [
  { label: '标题 1', action: (e: Editor) => e.chain().focus().toggleHeading({ level: 1 }).run(), check: (e: Editor) => e.isActive('heading', { level: 1 }) },
  { label: '标题 2', action: (e: Editor) => e.chain().focus().toggleHeading({ level: 2 }).run(), check: (e: Editor) => e.isActive('heading', { level: 2 }) },
  { label: '副标题', action: (e: Editor) => e.chain().focus().toggleHeading({ level: 3 }).run(), check: (e: Editor) => e.isActive('heading', { level: 3 }) },
  { label: '小标题', action: (e: Editor) => e.chain().focus().toggleHeading({ level: 4 }).run(), check: (e: Editor) => e.isActive('heading', { level: 4 }) },
  { label: '正文', action: (e: Editor) => e.chain().focus().setParagraph().run(), check: (e: Editor) => e.isActive('paragraph') },
  { label: '说明', action: (e: Editor) => e.chain().focus().toggleBlockquote().run(), check: (e: Editor) => e.isActive('blockquote') },
];

const formatButtons = [
  { icon: Bold, active: (e: Editor) => e.isActive('bold'), action: (e: Editor) => e.chain().focus().toggleBold().run(), label: '加粗' },
  { icon: Italic, active: (e: Editor) => e.isActive('italic'), action: (e: Editor) => e.chain().focus().toggleItalic().run(), label: '斜体' },
  { icon: Strikethrough, active: (e: Editor) => e.isActive('strike'), action: (e: Editor) => e.chain().focus().toggleStrike().run(), label: '删除线' },
  { icon: Code, active: (e: Editor) => e.isActive('code'), action: (e: Editor) => e.chain().focus().toggleCode().run(), label: '代码' },
];

const listButtons = [
  { icon: CheckSquare, active: (e: Editor) => e.isActive('taskList'), action: (e: Editor) => e.chain().focus().toggleTaskList().run(), label: '待办' },
  { icon: ChevronRight, active: (e: Editor) => e.isActive('toggle'), action: (e: Editor) => e.chain().focus().setToggleBlock().run(), label: '折叠' },
  { icon: List, active: (e: Editor) => e.isActive('bulletList'), action: (e: Editor) => e.chain().focus().toggleBulletList().run(), label: '无序列表' },
  { icon: ListOrdered, active: (e: Editor) => e.isActive('orderedList'), action: (e: Editor) => e.chain().focus().toggleOrderedList().run(), label: '有序列表' },
];

const alignButtons = [
  { icon: Outdent, action: (e: Editor) => e.chain().focus().liftListItem('listItem').run(), label: '左缩进' },
  { icon: Indent, action: (e: Editor) => e.chain().focus().sinkListItem('listItem').run(), label: '右缩进' },
  { icon: AlignLeft, active: (e: Editor) => e.isActive({ textAlign: 'left' }), action: (e: Editor) => e.chain().focus().setTextAlign('left').run(), label: '左对齐' },
  { icon: AlignCenter, active: (e: Editor) => e.isActive({ textAlign: 'center' }), action: (e: Editor) => e.chain().focus().setTextAlign('center').run(), label: '居中' },
  { icon: AlignRight, active: (e: Editor) => e.isActive({ textAlign: 'right' }), action: (e: Editor) => e.chain().focus().setTextAlign('right').run(), label: '右对齐' },
];

const formatColors = [
  '#1a1a1a', '#4a4a4a', '#9ca3af',
  '#7c3aed', '#3b82f6', '#06b6d4',
  '#22c55e', '#ec4899', '#f97316', '#78716c',
];

function FormatButton({ icon: Icon, active, onClick, label }: {
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        'flex size-8 items-center justify-center rounded-md border border-foreground/8 transition-colors duration-150 ease-craft',
        active ? 'bg-foreground/8 text-foreground' : 'bg-card text-foreground/55 hover:bg-foreground/4 hover:text-foreground/85'
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

export function FormatTab({ editor }: FormatTabProps) {
  return (
    <div className="space-y-4 p-3">
      {/* Text styles */}
      <section>
        <h4 className="mb-2 text-caption font-medium uppercase tracking-wider text-foreground/40">文本</h4>
        <div className="grid grid-cols-3 gap-1">
          {textStyles.map((style) => (
            <button
              key={style.label}
              type="button"
              onClick={() => style.action(editor)}
              className={cn(
                'rounded-md border border-foreground/8 px-2 py-1.5 text-meta transition-colors duration-150 ease-craft hover:bg-foreground/4',
                style.check(editor) ? 'bg-foreground/8 text-foreground' : 'bg-card text-foreground/55'
              )}
            >
              {style.label}
            </button>
          ))}
        </div>
      </section>

      {/* Block font size */}
      <section>
        <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">字号</h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="减小字号"
            onClick={() => editor.chain().focus().stepFontSize(-1).run()}
            className="flex-1 rounded-md border border-border py-1.5 text-[13px] transition-colors hover:bg-muted"
          >
            A−
          </button>
          <span className="w-14 text-center text-xs tabular-nums text-muted-foreground">
            {(editor.getAttributes('paragraph').fontSize as number | null)
              ?? (editor.getAttributes('heading').fontSize as number | null)
              ?? (editor.getAttributes('blockquote').fontSize as number | null)
              ?? 16}
            px
          </span>
          <button
            type="button"
            aria-label="增大字号"
            onClick={() => editor.chain().focus().stepFontSize(1).run()}
            className="flex-1 rounded-md border border-border py-1.5 text-[13px] transition-colors hover:bg-muted"
          >
            A＋
          </button>
        </div>
      </section>

      {/* Format tools */}
      <section>
        <div className="grid grid-cols-4 gap-1">
          {formatButtons.map((btn) => (
            <FormatButton
              key={btn.label}
              icon={btn.icon}
              active={btn.active(editor)}
              onClick={() => btn.action(editor)}
              label={btn.label}
            />
          ))}
        </div>
        <div className="mt-1 grid grid-cols-4 gap-1">
          {listButtons.map((btn) => (
            <FormatButton
              key={btn.label}
              icon={btn.icon}
              active={btn.active(editor)}
              onClick={() => btn.action(editor)}
              label={btn.label}
            />
          ))}
        </div>
        <div className="mt-1 grid grid-cols-5 gap-1">
          {alignButtons.map((btn) => (
            <FormatButton
              key={btn.label}
              icon={btn.icon}
              active={btn.active?.(editor)}
              onClick={() => btn.action(editor)}
              label={btn.label}
            />
          ))}
        </div>
      </section>

      {/* Color */}
      <section>
        <h4 className="mb-2 text-caption font-medium uppercase tracking-wider text-foreground/40">颜色</h4>
        <div className="grid grid-cols-5 gap-2">
          {formatColors.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              className={cn(
                'size-7 rounded-full border-2 border-transparent transition-transform hover:scale-110',
                editor.isActive('textStyle', { color }) && 'ring-2 ring-craft-accent ring-offset-2'
              )}
              style={{ backgroundColor: color }}
              onClick={() => editor.chain().focus().setColor(color).run()}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
