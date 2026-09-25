'use client';

import { Tldraw, inlineBase64AssetStore } from 'tldraw';
import { useSync } from '@tldraw/sync';
import 'tldraw/tldraw.css';
import { BOARD_FONT_URLS } from '@/components/whiteboard/board-fonts';

/**
 * Read-only canvas fed by the same sync room the board page uses, so the preview
 * never re-implements storage formats. `useSync` is a hook, which is why this lives
 * in its own lazily imported module instead of inline in the node view.
 */
export default function WhiteboardSyncCanvas({ uri }: { uri: string }) {
  const store = useSync({ uri, assets: inlineBase64AssetStore });

  if (store.status === 'loading') {
    return <div className="h-full w-full bg-muted/30" />;
  }

  if (store.status === 'error') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/30 text-xs text-muted-foreground">
        无法连接白板同步服务
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Tldraw
        store={store.store}
        assetUrls={{ fonts: BOARD_FONT_URLS }}
        components={{ Toolbar: null }}
        onMount={(editor) => {
          editor.updateInstanceState({ isReadonly: true });
        }}
      />
    </div>
  );
}
