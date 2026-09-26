'use client';

import { Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ImportButton } from '@/components/sidebar/ImportButton';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/lib/store/use-settings-store';

export function SidebarFooter() {
  const openSettings = useSettingsStore((s) => s.openSettings);

  return (
    <div className="mt-auto flex items-center justify-between border-t border-sidebar-border px-3 py-3">
      <div className="flex items-center gap-1">
        <ImportButton />
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          onClick={() => openSettings('space')}
          aria-label="设置"
        >
          <Settings className="size-4" />
        </Button>
      </div>
      <ThemeToggle />
    </div>
  );
}
