import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getRecentDocuments } from '@/actions/document/get';
import { DocumentCard } from '@/components/document/DocumentCard';
import { Clock } from 'lucide-react';
import { AppPageContainer } from '@/components/app/AppPageContainer';
import { AppPageHeader } from '@/components/app/AppPageHeader';

export default async function RecentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const recentDocs = await getRecentDocuments(50);

  return (
    <div className="flex-1 overflow-y-auto">
      <AppPageHeader title="最近编辑" />
      <AppPageContainer>
        {recentDocs.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {recentDocs.map(doc => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Clock className="mx-auto mb-2 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">还没有最近编辑的文档</p>
          </div>
        )}
      </AppPageContainer>
    </div>
  );
}
