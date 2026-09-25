'use client';

import { useEffect, useState } from 'react';
import EmojiPicker, { Theme as EmojiTheme, type EmojiClickData } from 'emoji-picker-react';
import { useTheme } from 'next-themes';

interface EditorHeaderProps {
  documentId: string;
  title: string;
  icon: string | null;
  onTitleChange: (title: string) => void;
  onIconChange: (icon: string | null) => void;
}

export function EditorHeader({
  title,
  icon,
  onTitleChange,
  onIconChange,
}: EditorHeaderProps) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (draftTitle === title) return;
    const timer = window.setTimeout(() => onTitleChange(draftTitle), 500);
    return () => window.clearTimeout(timer);
  }, [draftTitle, onTitleChange, title]);

  const setIcon = (data: EmojiClickData) => {
    onIconChange(data.emoji);
    setEmojiOpen(false);
  };

  return (
    <div className="mb-6 pt-8">
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setEmojiOpen((open) => !open)}
            aria-label="更换图标"
            aria-expanded={emojiOpen}
            title="更换图标"
            className="mt-1 flex size-10 items-center justify-center rounded-md text-2xl transition-colors duration-150 ease-craft hover:bg-foreground/4"
          >
            {icon || '📄'}
          </button>
          {emojiOpen && (
          <div className="absolute left-0 top-12 z-30 animate-in fade-in-0 zoom-in-95 duration-150">
              <EmojiPicker
                onEmojiClick={setIcon}
                width={Math.min(320, Math.max(240, window.innerWidth - 32))}
                height={380}
                theme={resolvedTheme === 'dark' ? EmojiTheme.DARK : EmojiTheme.LIGHT}
              />
            </div>
          )}
        </div>

        <input
          type="text"
          value={draftTitle ?? ''}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="无标题"
          className="flex-1 bg-transparent text-doctitle font-bold text-[#1F2225] outline-none placeholder:text-foreground/25 dark:text-[#F9F9F9]"
        />
      </div>
    </div>
  );
}
