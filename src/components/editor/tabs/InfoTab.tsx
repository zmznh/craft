'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar, User, Play, Folder, Copy, Star, Clock, Trash2,
  FileText, LayoutTemplate, Download,
} from 'lucide-react';
import { cn } from 'cn';
import { getBacklinks } from '@/actions/document/backlinks';
import { saveAsTemplate } from '@/actions/document/template';
import { isDocumentFavorite, toggleFavorite } from '@/actions/document/favorite';
import { deleteDocument } from '@/actions/document/delete';
import { moveDocument } from '@/actions/document/move';
import { createDocument } from '@/actions/document/create';
import { getFolders } from '@/actions/folder/get';
import { getDocuments } from '@/actions/document/get';
import { getOrCreateShare, setSharePublished } from '@/actions/document/share';
import { exportDocument, type ExportFormat } from '@/actions/document/export';
import { VersionDialog } from './VersionDialog';
import { CommentSection } from '../comments/CommentSection';
import type { Editor } from '@tiptap/react';

interface InfoTabProps {
  documentId: string;
  editor: import('@tiptap/react').Editor | null;
  wordCount: number;
  onClose: () => void;
}

interface Backlink {
  id: string;
  title: string;
  icon: string | null;
}

interface FolderItem {
  id: string;
  name: string;
  icon: string | null;
}

interface DocItem {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
}

export function InfoTab({ documentId, editor, wordCount }: InfoTabProps) {
  const router = useRouter();
  const [subTab, setSubTab] = useState<'info' | 'actions'>('info');
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setBusy(true);
    try {
      const file = await exportDocument(documentId, format);
      const blob = new Blob([file.body], { type: file.mime });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = file.filename;
      link.click();
      URL.revokeObjectURL(url);
      setActionError(null);
    } catch {
      setActionError('导出失败');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    try {
      await saveAsTemplate(documentId);
      setTemplateSaved(true);
      setTimeout(() => setTemplateSaved(false), 2000);
    } catch {
      alert('另存为模板失败');
    }
  };

  useEffect(() => {
    getBacklinks(documentId)
      .then((links) => {
        setBacklinks(links.map((l) => ({
          id: l.sourceDocumentId,
          title: l.sourceTitle,
          icon: l.sourceIcon,
        })));
      })
      .catch(() => {});
    isDocumentFavorite(documentId)
      .then((favored) => setIsFavorite(!!favored))
      .catch(() => {});
  }, [documentId]);

  const openMoveMenu = async () => {
    try {
      const [folderList, docList] = await Promise.all([
        getFolders(),
        getDocuments(),
      ]);
      setFolders(folderList ?? []);
      setDocs(
        (docList as Array<{ id: string; title: string; icon: string | null; parentId: string | null }>)
          .filter((d) => d.id !== documentId)
      );
      setMoving(true);
    } catch {
      setActionError('无法加载移动目标');
    }
  };

  const handleToggleFavorite = async () => {
    setBusy(true);
    try {
      const favored = await toggleFavorite(documentId);
      setIsFavorite(!!favored);
      setActionError(null);
    } catch {
      setActionError('收藏操作失败');
    } finally {
      setBusy(false);
    }
  };

  const handleDuplicate = async () => {
    setBusy(true);
    try {
      const copy = await createDocument({ duplicateFrom: documentId });
      setActionError(null);
      router.push(`/documents/${(copy as { id: string }).id}`);
    } catch {
      setActionError('创建副本失败');
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async (target: { folderId?: string | null; parentId?: string | null }) => {
    setBusy(true);
    try {
      await moveDocument(documentId, {
        folderId: target.folderId ?? null,
        parentId: target.parentId ?? null,
      });
      setMoving(false);
      setActionError(null);
      router.refresh();
    } catch {
      setActionError('移动失败');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteDocument(documentId);
      router.refresh();
      router.push('/documents');
    } catch {
      setActionError('删除失败');
      setBusy(false);
    }
  };

  return (
    <div className="p-3">
      {/* Sub-tab switcher */}
      <div className="mb-4 flex rounded-lg border border-foreground/8 bg-foreground/4 p-0.5">
        <button
          type="button"
          onClick={() => setSubTab('info')}
          className={cn(
            'flex-1 rounded-md px-3 py-1.5 text-meta font-medium transition-colors duration-150 ease-craft',
            subTab === 'info' ? 'bg-card text-foreground shadow-sm' : 'text-foreground/55 hover:text-foreground/85'
          )}
        >
          页面信息
        </button>
        <button
          type="button"
          onClick={() => setSubTab('actions')}
          className={cn(
            'flex-1 rounded-md px-3 py-1.5 text-meta font-medium transition-colors duration-150 ease-craft',
            subTab === 'actions' ? 'bg-card text-foreground shadow-sm' : 'text-foreground/55 hover:text-foreground/85'
          )}
        >
          动作
        </button>
      </div>

      {subTab === 'info' ? (
        <div className="space-y-4">
          {/* Properties */}
          <section>
            <h4 className="mb-2 text-caption font-medium uppercase tracking-wider text-foreground/40">属性</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-ui">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">已创建：</span>
                <span>今天</span>
              </div>
              <div className="flex items-center gap-2.5 text-ui">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">已更新：</span>
                <span>刚刚</span>
              </div>
              <div className="flex items-center gap-2.5 text-ui">
                <User className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">作者：</span>
                <span>你</span>
              </div>
            </div>
          </section>

          {/* Backlinks */}
          {backlinks.length > 0 && (
            <section>
              <h4 className="mb-2 text-caption font-medium uppercase tracking-wider text-foreground/40">
                反向链接 ({backlinks.length})
              </h4>
              <div className="space-y-1">
                {backlinks.map((link) => (
                  <Link
                    key={link.id}
                    href={`/documents/${link.id}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-ui transition-colors hover:bg-foreground/4"
                  >
                    <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{link.icon} {link.title || '未命名'}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Stats */}
          <section>
            <h4 className="mb-2 text-caption font-medium uppercase tracking-wider text-foreground/40">统计</h4>
            <div className="text-ui text-muted-foreground">{wordCount.toLocaleString()} 字</div>
          </section>

          <CommentSection documentId={documentId} editor={editor} />
        </div>
      ) : (
        <div className="space-y-1">
          {actionError && (
            <div className="rounded-md bg-destructive/10 px-2 py-1.5 text-meta text-destructive">
              {actionError}
            </div>
          )}

          {moving && (
            <div className="mb-2 rounded-lg border border-foreground/10 p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-meta font-medium">移动到...</span>
                <button
                  type="button"
                  onClick={() => setMoving(false)}
                  className="text-meta text-muted-foreground hover:text-foreground"
                >
                  取消
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleMove({ folderId: null, parentId: null })}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-meta text-muted-foreground transition-colors hover:bg-foreground/4 disabled:opacity-50"
                >
                  📄 独立文档（根目录）
                </button>
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    disabled={busy}
                    onClick={() => handleMove({ folderId: folder.id, parentId: null })}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-meta transition-colors hover:bg-foreground/4 disabled:opacity-50"
                  >
                    <span>{folder.icon || '📁'}</span>
                    <span className="truncate">{folder.name}</span>
                  </button>
                ))}
                <div className="mt-1 border-t border-foreground/10 pt-1" />
                {docs
                  .filter((d) => !d.parentId)
                  .map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      disabled={busy}
                      onClick={() => handleMove({ parentId: doc.id, folderId: null })}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-meta transition-colors hover:bg-foreground/4 disabled:opacity-50"
                    >
                      <span>{doc.icon || '📄'}</span>
                      <span className="truncate">{doc.title || '未命名'}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={async () => {
              setBusy(true);
              try {
                const share = await getOrCreateShare(documentId);
                await setSharePublished(documentId, true);
                window.open(`/p/${share.token}`, '_blank');
              } catch {
                setActionError('打开发布页失败');
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-ui transition-colors hover:bg-foreground/4 disabled:opacity-50"
          >
            <Play className="size-3.5 text-muted-foreground" />
            <span>展示</span>
          </button>
          <button
            type="button"
            onClick={openMoveMenu}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-ui transition-colors hover:bg-foreground/4"
          >
            <Folder className="size-3.5 text-muted-foreground" />
            <span>移动到...</span>
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={busy}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-ui transition-colors hover:bg-foreground/4 disabled:opacity-50"
          >
            <Copy className="size-3.5 text-muted-foreground" />
            <span>创建副本</span>
          </button>
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={busy}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-ui transition-colors hover:bg-foreground/4 disabled:opacity-50"
          >
            <Star className={cn('size-3.5', isFavorite ? 'fill-current text-amber-500' : 'text-muted-foreground')} />
            <span>{isFavorite ? '取消收藏' : '收藏文档'}</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAsTemplate}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-ui transition-colors hover:bg-foreground/4"
          >
            <LayoutTemplate className="size-3.5 text-muted-foreground" />
            <span>{templateSaved ? '已保存为模板' : '另存为模板'}</span>
          </button>
          <button
            type="button"
            onClick={() => setVersionsOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-ui transition-colors hover:bg-foreground/4"
          >
            <Clock className="size-3.5 text-muted-foreground" />
            <span>查看备份</span>
          </button>
          <button
            type="button"
            onClick={() => setShowExport((prev) => !prev)}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-ui transition-colors hover:bg-foreground/4"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>导出</span>
          </button>
          {showExport && (
            <div className="mb-2 rounded-lg border border-foreground/10 p-2">
              <div className="mb-1 grid grid-cols-2 gap-1">
                {(['markdown', 'html', 'text', 'json'] as const).map((format) => (
                  <button
                    key={format}
                    type="button"
                    disabled={busy}
                    onClick={() => handleExport(format)}
                    className="rounded-md border border-foreground/10 px-2 py-1.5 text-meta transition-colors hover:bg-foreground/4 disabled:opacity-50"
                  >
                    {format === 'markdown' ? 'Markdown' : format === 'html' ? 'HTML' : format === 'text' ? '纯文本' : 'JSON'}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="my-2 h-px bg-border" />
          {confirmDelete ? (
            <div className="rounded-md bg-destructive/10 p-2">
              <p className="mb-2 text-meta text-destructive">移入回收站？可在回收站恢复。</p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleDelete}
                  className="flex-1 rounded-md bg-destructive px-2 py-1 text-meta text-white disabled:opacity-50"
                >
                  确认删除
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-md border border-foreground/10 px-2 py-1 text-meta transition-colors duration-150 ease-craft hover:bg-foreground/4"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-ui text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" />
              <span>删除</span>
            </button>
          )}
        </div>
      )}

      <VersionDialog
        documentId={documentId}
        open={versionsOpen}
        onOpenChange={setVersionsOpen}
      />
    </div>
  );
}
