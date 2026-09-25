import { redirect } from 'next/navigation';
import { ViewTransition } from 'react';
import { auth } from '@/lib/auth/auth';
import { getTemplates } from '@/actions/document/get';
import { TemplateCard } from '@/components/document/TemplateCard';
import { LayoutTemplate } from 'lucide-react';

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const templates = await getTemplates();

  return (
    <ViewTransition>
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-4 pb-8">
        <h1 className="mb-5 text-title font-semibold">模板</h1>
        {templates.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5">
            {templates.map(doc => (
              <TemplateCard key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-[15px] bg-foreground/[0.03] px-6 text-center">
            <LayoutTemplate className="mx-auto mb-2 size-8 text-foreground/40" />
            <p className="text-ui font-medium text-foreground/40">还没有模板,在文档的动作面板中选择「另存为模板」创建</p>
          </div>
        )}
      </div>
    </div>
    </ViewTransition>
  );
}
