'use client';

import { Settings } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';

export function SidebarFooter() {
  return (
    <div className="mt-auto flex items-center justify-between border-t border-sidebar-border px-3 py-2">
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground"
        render={<Link href="/settings" />}
        nativeButton={false}
      >
        <Settings className="size-4" />
      </Button>
      <ThemeToggle />
    </div>
  );
}
