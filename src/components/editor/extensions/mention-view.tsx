'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { AtSign, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mentionIsPerson } from './mention-users';

export function MentionView({ node }: NodeViewProps) {
  const router = useRouter();
  const documentId = node.attrs.documentId as string;
  const title = node.attrs.title as string;
  const person = mentionIsPerson(node.attrs);
  const Icon = person ? AtSign : FileText;

  const className =
    'inline-flex items-center gap-1 rounded-md bg-foreground/4 px-1.5 py-0.5 text-ui text-foreground/85 transition-colors duration-150 ease-craft hover:bg-foreground/8';

  const label = (
    <>
      <Icon className="size-3.5 text-foreground/40" />
      <span>{title || '未命名'}</span>
    </>
  );

  // A person chip names someone in this document; there is no page to open, so it
  // stays a label instead of a button that would do nothing when clicked.
  if (person) {
    return (
      <NodeViewWrapper as="span" className="inline">
        <span className={className}>{label}</span>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="span" className="inline">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (documentId) {
            router.push(`/documents/${documentId}`);
          }
        }}
        className={className}
      >
        {label}
      </button>
    </NodeViewWrapper>
  );
}
