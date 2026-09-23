'use client';

import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Highlighter,
} from 'lucide-react';
import { cn } from 'cn';
import { AiToolbar } from '../ai/AiToolbar';
import { useAiBubbleStore } from '@/lib/store/use-ai-bubble-store';
import { mainBubbleKey } from './keys';

interface EditorBubbleMenuProps {
  editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  return (
    <TiptapBubbleMenu
      editor={editor}
      pluginKey={mainBubbleKey}
      options={{
        placement: 'top-start',
      }}
      shouldShow={({ state, from, to }) =>
        from !== to && !editor.isActive('table') && !useAiBubbleStore.getState().isOpen
      }
    >
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-md">
        <BubbleMenuButton
          label="加粗"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </BubbleMenuButton>
        <BubbleMenuButton
          label="斜体"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </BubbleMenuButton>
        <BubbleMenuButton
          label="下划线"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="size-4" />
        </BubbleMenuButton>
        <BubbleMenuButton
          label="删除线"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </BubbleMenuButton>
        <div className="mx-0.5 h-5 w-px bg-border" />
        <BubbleMenuButton
          label="行内代码"
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="size-4" />
        </BubbleMenuButton>
        <BubbleMenuButton
          label="链接"
          active={editor.isActive('link')}
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href;
            const url = window.prompt('URL', previousUrl);
            if (url === null) return;
            if (url === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }}
        >
          <Link className="size-4" />
        </BubbleMenuButton>
        <BubbleMenuButton
          label="高亮"
          active={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="size-4" />
        </BubbleMenuButton>
        <div className="mx-0.5 h-5 w-px bg-border" />
        <AiToolbar editor={editor} />
      </div>
    </TiptapBubbleMenu>
  );
}

interface BubbleMenuButtonProps {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}

function BubbleMenuButton({ active, onClick, label, children }: BubbleMenuButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={cn(
        'flex size-7 items-center justify-center rounded-md transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}
