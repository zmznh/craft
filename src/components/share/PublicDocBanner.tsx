'use client';

import Link from 'next/link';
import { LogIn } from 'lucide-react';

export function PublicDocBanner() {
  return (
    <footer className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background/90 px-6 py-3 backdrop-blur-sm">
      <span className="text-meta text-foreground/40">
        由 <Link href="/" className="font-medium text-foreground/55 transition-colors duration-150 ease-craft hover:text-foreground/85">Crafty</Link> 生成 · 只读视图
      </span>
      <Link
        href="/login"
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-meta text-foreground/40 transition-colors duration-150 ease-craft hover:bg-foreground/4 hover:text-foreground/85"
      >
        <LogIn className="size-3.5" />
        登录后编辑
      </Link>
    </footer>
  );
}
