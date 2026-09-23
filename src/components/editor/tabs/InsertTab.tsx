'use client';

import type { Editor } from '@tiptap/react';
import { GripVertical } from 'lucide-react';
import { cn } from 'cn';
import { slashCommands, getCommandCategories } from '../slash-menu/slash-commands';
import { SIDEBAR_SLASH_COMMAND_MIME } from '@/lib/dnd/sidebar-drag';
import { sidebarDragState } from '@/lib/dnd/sidebar-drag';
import type { SlashCommand } from '../slash-menu/slash-commands';

interface InsertTabProps {
  editor: Editor;
}

const categoryLabels: Record<string, string> = {
  基础块: '基础块',
  列表: '列表',
  高级块: '高级块',
  Callout: 'Callout',
  媒体: '媒体',
  布局: '布局',
  嵌入: '嵌入',
};

export function InsertTab({ editor }: InsertTabProps) {
  const categories = getCommandCategories();

  const handleInsert = (cmd: SlashCommand) => {
    const { from, to } = editor.state.selection;
    const range = from === to ? { from, to: from } : { from, to };
    cmd.command(editor, range);
  };

  const handleDragStart = (e: React.DragEvent, cmd: SlashCommand) => {
    const payload = { kind: 'slash-command' as const, name: cmd.name, category: cmd.category };
    // sidebar-drop.tsx 的 window dragstart 捕获依赖此共享引用作为 pending 暂存,
    // 组件状态在原生 DnD 事件下不可靠,故直接改写模块级对象。
    // eslint-disable-next-line react-hooks/immutability
    sidebarDragState.payload = payload;
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData(SIDEBAR_SLASH_COMMAND_MIME, JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', cmd.name);
  };

  const handleDragEnd = () => {
    sidebarDragState.payload = null;
  };

  return (
    <div className="p-3">
      <p className="mb-3 text-[11px] text-muted-foreground">将任何项目拖放到文档中</p>

      {categories.map((category) => {
        const cmds = slashCommands.filter((c) => c.category === category);
        if (!cmds.length) return null;
        return (
          <div key={category} className="mb-3">
            <h4 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
              {categoryLabels[category] || category}
            </h4>
            <div className="space-y-0.5">
              {cmds.map((cmd) => (
                <button
                  key={cmd.name}
                  type="button"
                  draggable
                  onDragStart={(e) => handleDragStart(e, cmd)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleInsert(cmd)}
                  className={cn(
                    'group flex w-full items-center gap-2.5 rounded-lg px-2 py-2',
                    'text-sm text-foreground transition-colors',
                    'hover:bg-muted cursor-grab active:cursor-grabbing'
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                    <cmd.icon className="size-3.5 text-muted-foreground" />
                  </span>
                  <span className="flex-1 text-left">
                    <span className="block text-[13px] leading-tight">{cmd.name}</span>
                    <span className="text-[11px] text-muted-foreground">{cmd.description}</span>
                  </span>
                  <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
