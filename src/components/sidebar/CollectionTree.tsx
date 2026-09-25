'use client';

import { useEffect, useState } from 'react';
import { getCollections } from '@/actions/collection/collection';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';

interface Collection {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
}

export function CollectionTree() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function load() {
      const data = await getCollections();
      setCollections(data as Collection[]);
      setLoading(false);
    }
    load();
  }, [pathname]);

  if (loading) {
    return <div className="px-3 py-2 text-[13px] text-muted-foreground">加载中...</div>;
  }

  if (collections.length === 0) {
    return <div className="px-3 py-2 text-[13px] text-muted-foreground">暂无集合</div>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {collections.map(collection => {
        const isActive = pathname === `/collections/${collection.id}`;
        return (
          <Link
            key={collection.id}
            href={`/collections/${collection.id}`}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors hover:bg-sidebar-hover',
              isActive && 'bg-sidebar-active text-sidebar-fg font-medium'
            )}
          >
            {collection.icon && <span className="text-base">{collection.icon}</span>}
            <span className="truncate">{collection.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
