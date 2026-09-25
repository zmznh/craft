import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getFavoriteDocuments } from '@/actions/document/get';
import { DocumentCard } from '@/components/document/DocumentCard';
import { Star } from 'lucide-react';
import { AppPageContainer } from '@/components/app/AppPageContainer';
import { AppPageHeader } from '@/components/app/AppPageHeader';

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const favoriteDocs = await getFavoriteDocuments();

  return (
    <div className="flex-1 overflow-y-auto">
      <AppPageHeader title="收藏" />
      <AppPageContainer>
        {favoriteDocs.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
      </AppPageContainer>
    </div>
  );
}
