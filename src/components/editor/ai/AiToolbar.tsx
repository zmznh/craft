'use client';

import type { Editor } from '@tiptap/react';
import { Sparkles } from 'lucide-react';
import { cn } from 'cn';
import { useAiBubbleStore } from '@/lib/store/use-ai-bubble-store';
import { aiBubbleKey, mainBubbleKey } from '../bubble-menu/keys';

interface AiToolbarProps {
  editor: Editor;
}

export function AiToolbar({ editor }: AiToolbarProps) {
  const isOpen = useAiBubbleStore((s) => s.isOpen);
  const toggle = useAiBubbleStore((s) => s.toggle);

  const handleToggle = () => {
    if (!isOpen && editor.state.selection.empty) return;
    toggle();
    if (!isOpen) {
      // switch from the main bubble menu to the AI one via explicit plugin metas
      editor.view.dispatch(
        editor.state.tr
          .setMeta(mainBubbleKey, 'hide')
          .setMeta(aiBubbleKey, 'show')
      );
    } else {
      editor.view.dispatch(editor.state.tr.setMeta(aiBubbleKey, 'hide'));
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title="AI 助手 (⌘J)"
      className={cn(
        'flex size-7 items-center justify-center rounded-md transition-colors duration-150 ease-craft',
        isOpen
          ? 'bg-craft-accent text-white'
          : 'text-foreground/55 hover:bg-foreground/4 hover:text-foreground/85'
      )}
    >
      <Sparkles className="size-4" />
    </button>
  );
}
