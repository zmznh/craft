'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCollection } from '@/actions/collection/collection';
import { useRouter } from 'next/navigation';

export function CreateCollectionButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const collection = await createCollection({
        name: name.trim(),
        icon: icon.trim() || undefined,
      });
      setOpen(false);
      setName('');
      setIcon('');
      router.push(`/collections/${collection.id}`);
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="h-8 rounded-lg bg-craft-accent text-ui font-medium text-white transition-colors duration-150 hover:bg-craft-accent-hover" />}>
        <Plus className="mr-2 size-4" />
        新建集合
      </DialogTrigger>
      <DialogContent className="rounded-xl border border-border shadow-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-title font-semibold">新建集合</DialogTitle>
            <DialogDescription className="text-ui text-foreground/40">
              创建一个新集合来组织和管理你的数据
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="icon" className="text-ui font-medium">图标（可选）</Label>
              <Input
                id="icon"
                placeholder="📊"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
                className="h-8 rounded-md border-border text-ui focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-ui font-medium">名称</Label>
              <Input
                id="name"
                placeholder="输入集合名称"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
                className="h-8 rounded-md border-border text-ui focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-lg border-border text-ui hover:bg-foreground/4"
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="h-8 rounded-lg bg-craft-accent text-ui font-medium text-white transition-colors duration-150 hover:bg-craft-accent-hover"
              disabled={loading || !name.trim()}
            >
              {loading ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
