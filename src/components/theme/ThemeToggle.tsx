'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { updatePreferences } from '@/actions/user/preferences';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Button variant="ghost" size="icon-sm" disabled />;
  }

  const icon = theme === 'dark'
    ? <Moon className="size-4" />
    : theme === 'light'
      ? <Sun className="size-4" />
      : <Monitor className="size-4" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="切换主题" />}
      >
        {icon}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { setTheme('light'); void updatePreferences({ theme: 'light' }).catch(() => {}); }}>
          <Sun className="mr-2 size-4" />
          浅色
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme('dark'); void updatePreferences({ theme: 'dark' }).catch(() => {}); }}>
          <Moon className="mr-2 size-4" />
          深色
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme('system'); void updatePreferences({ theme: 'system' }).catch(() => {}); }}>
          <Monitor className="mr-2 size-4" />
          跟随系统
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
