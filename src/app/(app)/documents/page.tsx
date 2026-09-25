import { redirect } from 'next/navigation';
import { ViewTransition } from 'react';
import { auth } from '@/lib/auth/auth';
import { getRecentDocuments } from '@/actions/document/get';
import { getFavoriteDocuments } from '@/actions/document/get';
import { DocumentCard } from '@/components/document/DocumentCard';
import { QuickActions } from '@/components/document/QuickActions';

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const [recentDocs, favoriteDocs] = await Promise.all([
    getRecentDocuments(8),
    getFavoriteDocuments()
  ]);

  return (
    <ViewTransition>
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-4 pb-8">
        <h1 className="mb-5 text-title font-semibold">文档</h1>

        <QuickActions />

        {favoriteDocs.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-sec font-semibold text-foreground/55">收藏</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5">
              {favoriteDocs.slice(0, 6).map(doc => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-sec font-semibold text-foreground/55">最近编辑</h2>
          {recentDocs.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5">
              {recentDocs.map(doc => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[180px] items-center justify-center rounded-[15px] bg-foreground/[0.03] px-6 text-center">
              <p className="text-ui font-medium text-foreground/40">
                还没有文档，点击左上角 + 创建第一个文档
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
    </ViewTransition>
  );
}
