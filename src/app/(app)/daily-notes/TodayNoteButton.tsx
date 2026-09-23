'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOrCreateTodayNote } from '@/actions/daily-notes/daily-notes';

export function TodayNoteButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const note = await getOrCreateTodayNote();
      router.push(`/documents/${note.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={handleClick} disabled={loading}>
      <CalendarDays className="size-4" />
      {loading ? '打开中…' : '打开今天的日记'}
    </Button>
  );
}
