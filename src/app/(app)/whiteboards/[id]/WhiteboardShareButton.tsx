'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { WhiteboardShareDialog } from '@/components/whiteboard/WhiteboardShareDialog';

export function WhiteboardShareButton({ whiteboardId }: { whiteboardId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="分享白板"
        title="分享"
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Share2 className="size-4" />
      </button>
      <WhiteboardShareDialog whiteboardId={whiteboardId} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
