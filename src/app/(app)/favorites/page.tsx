import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getFavoriteDocuments } from '@/actions/document/get';
import { DocumentCard } from '@/components/document/DocumentCard';
import { Star } from 'lucide-react';

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const favoriteDocs = await getFavoriteDocuments();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        <h1 className="mb-6 text-2xl font-semibold">收藏</h1>
        {favoriteDocs.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteDocs.map(doc => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Star className="mx-auto mb-2 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">还没有收藏文档</p>
          </div>
        )}
      </div>
    </div>
  );
}
