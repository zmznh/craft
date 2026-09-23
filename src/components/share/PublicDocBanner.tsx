'use client';

import Link from 'next/link';
import { LogIn } from 'lucide-react';

export function PublicDocBanner() {
  return (
    <footer className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background/90 px-6 py-3 backdrop-blur-sm">
      <span className="text-xs text-muted-foreground">
        由 <Link href="/" className="font-medium hover:text-foreground">Crafty</Link> 生成 · 只读视图
      </span>
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <LogIn className="size-3.5" />
        登录后编辑
      </Link>
    </footer>
  );
}
