'use client';

import { useRef, useState } from 'react';
import { Download, FileText, FolderUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { importMarkdownDocuments } from '@/actions/document/import';
import { pickTextBundleEntry } from '@/lib/import/markdown';

interface PendingFile {
  name: string;
  text: string;
}

export function ImportButton() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function run(files: PendingFile[]) {
    if (!files.length) return;
    setBusy(true);
    try {
      const created = await importMarkdownDocuments({ files });
      if (created.length) router.push(`/documents/${created[0].id}`);
    } finally {
      setBusy(false);
    }
  }

  async function readMarkdown(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list).filter((file) => /\.(md|markdown|txt)$/i.test(file.name));
    await run(await Promise.all(picked.map(async (file) => ({ name: file.name, text: await file.text() }))));
  }

  async function readBundles(list: FileList | null) {
    if (!list) return;
    const entries = Array.from(list).filter((file) => file.webkitRelativePath.includes('/'));
    const roots = new Set(entries.map((file) => file.webkitRelativePath.split('/')[0]));

    const files: PendingFile[] = [];
    for (const root of roots) {
      const members = entries.filter((file) => file.webkitRelativePath.startsWith(`${root}/`));
      const entry = pickTextBundleEntry(members.map((file) => file.webkitRelativePath));
      const found = members.find((file) => file.webkitRelativePath === entry);
      if (found) files.push({ name: root, text: await found.text() });
    }
    await run(files);
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        multiple
        accept=".md,.markdown,.txt,text/markdown,text/plain"
        className="hidden"
        onChange={(event) => void readMarkdown(event.target.files)}
      />
      <input
        ref={folderRef}
        type="file"
        multiple
        // A Text Bundle is a folder, so the picker has to walk one.
        {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
        className="hidden"
        onChange={(event) => void readBundles(event.target.files)}
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label="导入" disabled={busy} />}
        >
          <Download className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => fileRef.current?.click()}>
            <FileText className="mr-2 size-4" />
            Markdown 文件…
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => folderRef.current?.click()}>
            <FolderUp className="mr-2 size-4" />
            Text Bundle 文件夹…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
