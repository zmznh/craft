'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createWhiteboard } from '@/actions/whiteboard/whiteboard';

export function CreateWhiteboardButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const board = await createWhiteboard();
      router.push(`/whiteboards/${(board as { id: string }).id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={handleClick} disabled={loading}>
      <Plus className="size-4" />
      {loading ? '创建中…' : '新建白板'}
    </Button>
  );
}
