'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import { useTheme } from 'next-themes';
import { saveWhiteboardData } from '@/actions/whiteboard/whiteboard';

interface BoardProps {
  whiteboardId: string;
  initialData: unknown;
}

export function Board({ whiteboardId, initialData }: BoardProps) {
  const [editor, setEditor] = useState<any>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!editor) return;
    editor.updateUserPreferences({ colorScheme: resolvedTheme === 'dark' ? 'dark' : 'light' });
  }, [editor, resolvedTheme]);

  const handleMount = useCallback(
    (ed: any) => {
      setEditor(ed);
      if (process.env.NODE_ENV === 'development') {
        (window as any).__tldrawEditor = ed;
      }

      if (initialData && typeof initialData === 'object') {
        try {
          import('tldraw').then(({ loadSnapshot }) => {
            loadSnapshot(ed.store, initialData as any);
          });
        } catch {
          // corrupt snapshot — start with a fresh board
        }
      }

      ed.store.listen(
        () => {
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
          saveTimerRef.current = setTimeout(async () => {
            const { getSnapshot } = await import('tldraw');
            const snapshot = getSnapshot(ed.store) as unknown as Record<string, unknown>;
            const str = JSON.stringify(snapshot);
            if (str !== lastSavedRef.current) {
              lastSavedRef.current = str;
              await saveWhiteboardData(whiteboardId, snapshot);
            }
          }, 1500);
        },
        { scope: 'all' }
      );
    },
    [whiteboardId, initialData]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return (
    <div className="h-full w-full">
      <Tldraw onMount={handleMount} />
    </div>
  );
}
