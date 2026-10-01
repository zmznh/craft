'use client';

import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { AtSign } from 'lucide-react';
import type { Editor } from '@tiptap/react';
import { listMentionCandidates } from '@/actions/document/members';
import type { MentionCandidate } from '@/actions/document/members';
import { mentionLabel, rankMentionCandidates } from './mention-users';
import { cn } from 'cn';

const MAX_ROWS = 8;

/**
 * Keys reach the menu through the suggestion plugin rather than a window listener:
 * a `keydown` on the editor is answered by the plugin before ProseMirror's base
 * keymap runs, and by the time the event would bubble out, an Enter has already
 * split the block and unmounted this component.
 */
export interface MentionMenuHandle {
  selectRecommendation: () => void;
  moveSelection: (delta: number) => void;
}

interface MentionUserMenuProps {
  editor: Editor;
  query: string;
  documentId: string;
  range: { from: number; to: number };
  onClose: () => void;
  ref?: React.Ref<MentionMenuHandle>;
}

export function MentionUserMenu({ editor, query, documentId, range, onClose, ref }: MentionUserMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [people, setPeople] = useState<MentionCandidate[]>([]);
  // Starts true: before the first query lands the menu knows nothing, and saying
  // 「无匹配人员」 for one frame would be a claim the data has not earned.
  const [loading, setLoading] = useState(true);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const latestQuery = useRef(query);

  useEffect(() => {
    latestQuery.current = query;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await listMentionCandidates(documentId);
        if (latestQuery.current === query) setPeople(rankMentionCandidates(found, query, MAX_ROWS));
      } finally {
        if (latestQuery.current === query) setLoading(false);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [query, documentId]);

  useLayoutEffect(() => {
    const selected = itemRefs.current[selectedIndex];
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const selectItem = useCallback(
    (index: number) => {
      const person = people[index];
      if (!person) return;
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMention({ userId: person.userId, documentId: null, title: mentionLabel(person) })
        .run();
      onClose();
    },
    [people, editor, range, onClose]
  );

  useImperativeHandle(
    ref,
    () => ({
      selectRecommendation: () => selectItem(selectedIndex),
      moveSelection: (delta) =>
        setSelectedIndex((prev) => {
          if (people.length === 0) return 0;
          const next = prev + delta;
          if (next < 0) return people.length - 1;
          if (next >= people.length) return 0;
          return next;
        }),
    }),
    [selectItem, selectedIndex, people.length]
  );

  return (
    <div className="max-h-64 w-72 overflow-y-auto rounded-lg border border-border bg-popover p-1.5 shadow-md">
      <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        提及人员
      </div>
      {people.length === 0 && (
        <div className="px-2 py-3 text-sm text-muted-foreground">
          {loading ? '搜索中…' : '无匹配人员'}
        </div>
      )}
      {people.map((person, idx) => (
        <button
          key={person.userId}
          ref={(el) => {
            itemRefs.current[idx] = el;
          }}
          type="button"
          onClick={() => selectItem(idx)}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors',
            idx === selectedIndex ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted'
          )}
        >
          <AtSign className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">{mentionLabel(person)}</span>
            {person.name && person.email ? (
              <span className="block truncate text-[11px] text-muted-foreground">{person.email}</span>
            ) : null}
          </span>
        </button>
      ))}
    </div>
  );
}
