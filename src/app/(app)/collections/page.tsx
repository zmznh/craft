import { getCollections } from '@/actions/collection/collection';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { CreateCollectionButton } from './CreateCollectionButton';
import { AppPageContainer } from '@/components/app/AppPageContainer';
import { AppPageHeader } from '@/components/app/AppPageHeader';

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="flex-1 overflow-auto">
      <AppPageHeader title="集合" actions={<CreateCollectionButton />} />
      <AppPageContainer>

        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Plus className="size-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-lg font-medium">暂无集合</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              创建你的第一个集合来组织数据
            </p>
            <CreateCollectionButton />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {collections.map((collection: any) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <div className="mb-2 flex items-center gap-2">
                  {collection.icon && (
                    <span className="text-2xl">{collection.icon}</span>
                  )}
                  <h3 className="font-medium group-hover:text-primary">
                    {collection.name}
                  </h3>
                </div>
                {collection.description && (
                  <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                    {collection.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{collection._count.items} 项</span>
                  <span>{collection.properties.length} 个属性</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </AppPageContainer>
    </div>
  );
}
