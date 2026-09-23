import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getRecentDocuments } from '@/actions/document/get';
import { DocumentCard } from '@/components/document/DocumentCard';
import { Clock } from 'lucide-react';

export default async function RecentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const recentDocs = await getRecentDocuments(50);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        <h1 className="mb-6 text-2xl font-semibold">最近编辑</h1>
        {recentDocs.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </div>
  );
}
