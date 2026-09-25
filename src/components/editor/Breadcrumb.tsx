'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbProps {
  title: string;
}

export function Breadcrumb({ title }: BreadcrumbProps) {
  return (
    <nav className="flex min-w-0 items-center gap-1 overflow-hidden text-sec font-medium">
      <Link
        href="/documents"
        className="shrink-0 rounded-md px-1.5 py-0.5 text-foreground/40 transition-colors duration-150 ease-craft hover:bg-foreground/4 hover:text-foreground/70"
      >
        文档
      </Link>
      <ChevronRight className="size-3.5 shrink-0 text-foreground/25" />
      <span className="truncate rounded-md px-1.5 py-0.5 text-foreground/40">{title || '无标题'}</span>
    </nav>
  );
}
