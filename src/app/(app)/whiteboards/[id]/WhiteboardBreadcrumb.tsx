'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { renameWhiteboard } from '@/actions/whiteboard/whiteboard';

interface WhiteboardBreadcrumbProps {
  id: string;
  name: string;
  icon: string | null;
}

export function WhiteboardBreadcrumb({ id, name, icon }: WhiteboardBreadcrumbProps) {
  const router = useRouter();
  const [value, setValue] = useState(name);

  const handleRename = async () => {
    if (value !== name && value.trim()) {
      await renameWhiteboard(id, value.trim());
      router.refresh();
    }
  };

  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link href="/whiteboards" className="text-muted-foreground hover:text-foreground">
        白板
      </Link>
      <span className="text-muted-foreground">/</span>
      <span className="text-base leading-none">{icon ?? '🎨'}</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleRename}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        className="bg-transparent font-medium outline-none"
        aria-label="白板名称"
      />
    </nav>
  );
}
