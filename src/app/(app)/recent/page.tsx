import { redirect } from 'next/navigation';
import { ViewTransition } from 'react';
import { auth } from '@/lib/auth/auth';
import { getRecentDocuments } from '@/actions/document/get';
import { DocumentCard } from '@/components/document/DocumentCard';
import { Clock } from 'lucide-react';

export default async function RecentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const recentDocs = await getRecentDocuments(50);

  return (
    <ViewTransition>
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-4 pb-8">
        <h1 className="mb-5 text-title font-semibold">最近编辑</h1>
        {recentDocs.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5">
            {recentDocs.map(doc => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-[15px] bg-foreground/[0.03] px-6 text-center">
            <Clock className="mx-auto mb-2 size-8 text-foreground/40" />
            <p className="text-ui font-medium text-foreground/40">还没有最近编辑的文档</p>
          </div>
        )}
      </div>
    </div>
    </ViewTransition>
  );
}
