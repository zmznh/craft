import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { getSharedDocument } from '@/actions/document/share';
import { findShare } from '@/lib/share/resolve';
import { SharedDocView } from '@/components/share/SharedDocView';
import { PublicDocBanner } from '@/components/share/PublicDocBanner';
import { PasscodeGate } from '@/components/share/PasscodeGate';
import { shareCookieName, verifyShareCookie } from '@/lib/share-passcode';

interface PublishPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublishPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getSharedDocument(slug);
  if (!doc || !doc.isPublished) return { title: '页面不存在' };

  const title = `${doc.icon ? `${doc.icon} ` : ''}${doc.title || '未命名'}`;
  const description = (doc.plainText ?? '').slice(0, 160) || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: doc.coverImage ? [doc.coverImage] : undefined,
    },
    alternates: { canonical: `/p/${slug}` },
  };
}

export default async function PublishPage({ params }: PublishPageProps) {
  const { slug } = await params;
  const doc = await getSharedDocument(slug);

  if (!doc || !doc.isPublished) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">页面不存在或未发布</p>
      </div>
    );
  }

  if (doc.passcodeProtected) {
    const share = await findShare(slug);
    const passcode = (share as any)?.passcode ?? null;
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(shareCookieName(slug))?.value;
    if (!verifyShareCookie(slug, passcode, cookieValue)) {
      return (
        <PasscodeGate token={slug} path={`/p/${slug}`} title={doc.title} icon={doc.icon} />
      );
    }
  }

  return (
    <SharedDocView
      documentId={slug}
      title={doc.title}
      icon={doc.icon}
      coverImage={doc.coverImage}
      coverType={doc.coverType}
      content={doc.content}
      pageStyle={doc.pageStyle}
      styled
      header={<PublicDocBanner />}
    />
  );
}
