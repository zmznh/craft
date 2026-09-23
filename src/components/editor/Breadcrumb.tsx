'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbProps {
  title: string;
}

export function Breadcrumb({ title }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 overflow-hidden text-sm text-muted-foreground">
      <Link href="/documents" className="shrink-0 hover:text-foreground">
        文档
      </Link>
      <ChevronRight className="size-3.5 shrink-0" />
      <span className="truncate">{title || '无标题'}</span>
    </nav>
  );
}
