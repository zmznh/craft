import { redirect } from 'next/navigation';
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
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        <h1 className="mb-6 text-2xl font-semibold">文档</h1>

        <QuickActions />

        {favoriteDocs.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-medium">收藏</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteDocs.slice(0, 6).map(doc => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-lg font-medium">最近编辑</h2>
          {recentDocs.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentDocs.map(doc => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                还没有文档，点击左上角 + 创建第一个文档
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
