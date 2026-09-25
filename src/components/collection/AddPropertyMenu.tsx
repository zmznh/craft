'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { addProperty } from '@/actions/collection/properties';
import { getCollections } from '@/actions/collection/collection';
import { evaluateFormula, type FormulaResult } from '@/lib/collection/formula';

const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: 'text', label: '文本' },
  { value: 'number', label: '数字' },
  { value: 'select', label: '单选' },
  { value: 'multi_select', label: '多选' },
  { value: 'date', label: '日期' },
  { value: 'checkbox', label: '勾选框' },
  { value: 'url', label: '链接' },
  { value: 'email', label: '邮箱' },
  { value: 'file', label: '文件' },
  { value: 'relation', label: '关联' },
  { value: 'formula', label: '公式' },
  { value: 'created_at', label: '创建时间' },
  { value: 'updated_at', label: '更新时间' },
];

export function AddPropertyMenu({ collectionId }: { collectionId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [expression, setExpression] = useState('');
  const [targetId, setTargetId] = useState('');
  const [others, setOthers] = useState<{ id: string; name: string }[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || type !== 'relation') return;
    getCollections().then((list) =>
      setOthers((list as any[]).filter((item) => item.id !== collectionId).map((item) => ({ id: item.id, name: item.name })))
    ).catch(() => setOthers([]));
  }, [open, type, collectionId]);

  const preview = type === 'formula' && expression ? evaluateFormula(expression, {}) : null;

  const submit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const config =
        type === 'formula' ? { expression } : type === 'relation' ? { collectionId: targetId || null } : undefined;
      await addProperty({ collectionId, name: name.trim(), type, config });
      setOpen(false);
      setName('');
      setExpression('');
      setTargetId('');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        属性
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新属性</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="属性名称"
              aria-label="属性名称"
            />
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              aria-label="属性类型"
              className="h-9 rounded-md border border-border bg-background px-2 text-sm"
            >
              {PROPERTY_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {type === 'formula' && (
              <div className="flex flex-col gap-1">
                <Input
                  value={expression}
                  onChange={(event) => setExpression(event.target.value)}
                  placeholder="{价格} * {数量}"
                  aria-label="公式表达式"
                />
                <p className="text-xs text-muted-foreground">
                  {expression
                    ? preview?.ok
                      ? `示例结果：${preview.value}`
                      : (preview as Extract<FormulaResult, { ok: false }>).error
                    : '用 {属性名} 引用同一行的其它属性'}
                </p>
              </div>
            )}

            {type === 'relation' && (
              <select
                value={targetId}
                onChange={(event) => setTargetId(event.target.value)}
                aria-label="关联集合"
                className="h-9 rounded-md border border-border bg-background px-2 text-sm"
              >
                <option value="">选择目标集合…</option>
                {others.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button disabled={busy || !name.trim()} onClick={() => void submit()}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
