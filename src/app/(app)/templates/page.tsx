import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getTemplates } from '@/actions/document/get';
import { TemplateCard } from '@/components/document/TemplateCard';
import { LayoutTemplate } from 'lucide-react';

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const templates = await getTemplates();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        <h1 className="mb-6 text-2xl font-semibold">模板</h1>
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map(doc => (
              <TemplateCard key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <LayoutTemplate className="mx-auto mb-2 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">还没有模板,在文档的动作面板中选择「另存为模板」创建</p>
          </div>
        )}
      </div>
    </div>
  );
}
