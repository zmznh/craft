'use client';

import { useEffect, useState } from 'react';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';

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
            className="mt-1 flex size-10 items-center justify-center rounded-md text-2xl transition-colors hover:bg-muted"
          >
            {icon || '📄'}
          </button>
          {emojiOpen && (
            <div className="absolute left-0 top-12 z-30">
              <EmojiPicker onEmojiClick={setIcon} width={320} height={380} />
            </div>
          )}
        </div>

        <input
          type="text"
          value={draftTitle ?? ''}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="无标题"
          className="flex-1 bg-transparent font-serif text-3xl font-normal outline-none placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  );
}
