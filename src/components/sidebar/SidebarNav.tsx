'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Star,
  Clock,
  CalendarDays,
  CheckSquare,
  FileText,
  Home,
  LayoutTemplate,
} from 'lucide-react';
import { cn } from 'cn';

const navItems = [
  { href: '/documents', label: '首页', icon: Home },
  { href: '/favorites', label: '收藏', icon: Star },
  { href: '/recent', label: '最近', icon: Clock },
  { href: '/daily-notes', label: '日记', icon: FileText },
  { href: '/tasks', label: '任务', icon: CheckSquare },
  { href: '/calendar', label: '日历', icon: CalendarDays },
  { href: '/templates', label: '模板', icon: LayoutTemplate },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-2.5 py-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex h-8 items-center gap-2.5 rounded-md py-[7px] pl-1.5 pr-[11px] text-ui transition-colors duration-150 [transition-timing-function:var(--ease-craft)]',
              isActive
                ? 'bg-sidebar-active text-foreground/85'
                : 'text-foreground/85 hover:bg-sidebar-hover'
            )}
          >
            <item.icon className="size-[18px] shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
