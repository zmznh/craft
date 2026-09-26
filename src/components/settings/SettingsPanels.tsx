'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Camera,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Pencil,
  SquarePlus,
} from 'lucide-react';
import { getPreferences, updatePreferences } from '@/actions/user/preferences';
import { logout } from '@/actions/user/profile';
import { Switch } from '@/components/ui/switch';
import type { SettingsSection } from '@/lib/store/use-settings-store';
import { cn } from 'cn';

interface PanelProps {
  section: SettingsSection;
  profile: { name: string; email: string } | null;
  spaceName: string;
}

function RowCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-xl bg-foreground/4', className)}>{children}</div>;
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[15px] font-semibold">{children}</h3>;
}

function GroupDesc({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[13px] text-foreground/55">{children}</p>;
}

function EditIcon() {
  return <Pencil className="size-3.5 shrink-0 text-foreground/45" />;
}

function SpaceIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex items-center justify-center font-semibold text-white', className)}
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgb(255 255 255 / .16) 0 26px, rgb(255 255 255 / 0) 26px 68px), linear-gradient(to bottom right, #d33bf0, #7e22ce)',
      }}
    >
      Zs
    </div>
  );
}

function ThemePreview({ variant }: { variant: 'system' | 'light' | 'dark' }) {
  const light = (
    <div className="flex-1 bg-gradient-to-b from-[#e8c9a0] to-[#cf9f74]">
      <div className="ml-[15%] mt-[12%] h-[76%] w-[70%] rounded-md bg-white p-2">
        <div className="h-1 w-1/2 rounded bg-foreground/25" />
        <div className="mt-1.5 h-1 w-2/3 rounded bg-foreground/15" />
        <div className="mt-1 h-1 w-1/3 rounded bg-[#2e6de9]" />
      </div>
    </div>
  );
  const dark = (
    <div className="flex-1 bg-gradient-to-b from-[#4a5368] to-[#23262e]">
      <div className="ml-[15%] mt-[12%] h-[76%] w-[70%] rounded-md bg-[#1c1c1e] p-2">
        <div className="h-1 w-1/2 rounded bg-white/30" />
        <div className="mt-1.5 h-1 w-2/3 rounded bg-white/15" />
        <div className="mt-1 h-1 w-1/3 rounded bg-[#71b2ff]" />
      </div>
    </div>
  );
  return (
    <div className="flex h-[116px] overflow-hidden rounded-lg">
      {variant === 'light' && light}
      {variant === 'dark' && dark}
      {variant === 'system' && (
        <>
          <div className="flex flex-1">{light}</div>
          <div className="flex flex-1">{dark}</div>
        </>
      )}
    </div>
  );
}

const ACCENTS = [
  { key: 'blue', color: '#2e6de9' },
  { key: 'pink', color: '#d6179b' },
  { key: 'green', color: '#00c2a6' },
  { key: 'purple', color: '#5e02d2' },
  { key: 'yellow', color: '#e4c011' },
  { key: 'gray', color: '#525c66' },
];

export function SettingsPanel({ section, profile, spaceName }: PanelProps) {
  const { setTheme } = useTheme();
  const [prefs, setPrefs] = useState<{ theme: string; editorFont: string; editorWidth: string } | null>(null);
  const [accent, setAccent] = useState('blue');
  const [notify, setNotify] = useState({ comments: true, reminders: true, daily: true });

  useEffect(() => {
    getPreferences()
      .then(setPrefs)
      .catch(() => setPrefs(null));
  }, []);

  const setPref = async (patch: Partial<{ theme: string; editorFont: string; editorWidth: string }>) => {
    if (patch.theme) setTheme(patch.theme);
    // A click can land before the initial preferences fetch resolves; join it instead of dropping it.
    const base = prefs ?? (await getPreferences().catch(() => null));
    if (!base) return;
    const next = { ...base, ...patch };
    setPrefs(next);
    await updatePreferences(patch).catch(() => setPrefs(base));
  };

  switch (section) {
    case 'space':
      return (
        <div className="space-y-6">
          <div className="flex justify-center pt-6">
            <div className="relative">
              <SpaceIcon className="size-32 rounded-[28px] text-5xl" />
              <button
                type="button"
                aria-label="更换空间图标"
                className="absolute -right-3 -bottom-3 flex size-10 items-center justify-center rounded-full bg-background shadow-(--shadow-xxs)"
              >
                <Camera className="size-4" />
              </button>
            </div>
          </div>
          <RowCard className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-xs text-foreground/55">空间名称</div>
              <div className="mt-1 text-[15px]">{spaceName}</div>
            </div>
            <EditIcon />
          </RowCard>
        </div>
      );

    case 'published':
      return (
        <div className="space-y-4">
          <RowCard className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-xs text-foreground/55">craft.me 链接</div>
              <div className="mt-1 text-[15px] text-(--craft-accent)">craft.me/s/crafty</div>
            </div>
            <EditIcon />
          </RowCard>
          <RowCard className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-xs text-foreground/55">自定义域名</div>
              <div className="mt-1 text-[15px] text-foreground/55">未设置</div>
            </div>
            <EditIcon />
          </RowCard>
        </div>
      );

    case 'tags':
      return (
        <div className="space-y-4">
          <RowCard className="flex items-center justify-between px-4 py-3">
            <div className="text-[13px] font-medium">使用标签</div>
            <Switch defaultChecked className="data-checked:bg-(--craft-accent)" />
          </RowCard>
          <GroupDesc>忽略列表中的标签不会显示在侧栏与设置里。</GroupDesc>
        </div>
      );

    case 'appearance':
      return (
        <div className="space-y-4">
          <RowCard className="grid grid-cols-3 gap-4 p-4">
            {(['system', 'light', 'dark'] as const).map((variant) => {
              const selected = (prefs?.theme ?? 'system') === variant;
              return (
                <button
                  key={variant}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setPref({ theme: variant })}
                >
                  <div className={cn('rounded-lg', selected && 'ring-2 ring-(--craft-accent)')}>
                    <ThemePreview variant={variant} />
                  </div>
                  <div
                    className={cn(
                      'mt-2 text-center text-[13px]',
                      selected ? 'font-medium text-(--craft-accent)' : 'text-foreground/45'
                    )}
                  >
                    {variant === 'system' ? '系统' : variant === 'light' ? '浅色' : '深色'}
                  </div>
                </button>
              );
            })}
          </RowCard>
          <RowCard className="w-[360px] p-4">
            <div className="text-[15px] font-semibold">强调色</div>
            <div className="mt-0.5 text-xs text-foreground/55">选择强调色</div>
            <div className="mt-3 flex gap-3">
              {ACCENTS.map(({ key, color }) => (
                <button
                  key={key}
                  type="button"
                  aria-label={key}
                  aria-pressed={accent === key}
                  onClick={() => setAccent(key)}
                  className={cn(
                    'size-8 rounded-full',
                    accent === key && 'ring-2 ring-(--craft-accent) ring-offset-2 ring-offset-background'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </RowCard>
        </div>
      );

    case 'language':
      return (
        <RowCard className="flex w-[360px] items-center justify-between px-4 py-3">
          <div className="text-[13px] font-medium">语言</div>
          <div className="flex items-center gap-2 rounded-lg bg-foreground/4 px-3 py-1.5 text-[13px]">
            简体中文
            <ChevronDown className="size-3.5 text-foreground/45" />
          </div>
        </RowCard>
      );

    case 'advanced': {
      const fontOptions = [
        { value: 'inter', label: 'Inter（默认）' },
        { value: 'serif', label: '衬线' },
        { value: 'mono', label: '等宽' },
        { value: 'rounded', label: '圆体' },
      ];
      const widthOptions = [
        { value: 'narrow', label: '窄' },
        { value: 'default', label: '默认' },
        { value: 'wide', label: '宽' },
      ];
      return (
        <div className="space-y-4">
          <RowCard className="px-4 py-3">
            <div className="text-[13px] font-medium">编辑器字体</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {fontOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPref({ editorFont: value })}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-[13px] transition-colors hover:bg-foreground/4',
                    prefs?.editorFont === value && 'bg-foreground/8 font-medium'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </RowCard>
          <RowCard className="px-4 py-3">
            <div className="text-[13px] font-medium">编辑器宽度</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {widthOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPref({ editorWidth: value })}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-[13px] transition-colors hover:bg-foreground/4',
                    prefs?.editorWidth === value && 'bg-foreground/8 font-medium'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </RowCard>
        </div>
      );
    }

    case 'account':
      return (
        <div className="space-y-4">
          <RowCard className="flex gap-6 p-6">
            <div className="relative shrink-0">
              <div className="flex size-26 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 text-4xl font-semibold text-white">
                {profile?.name?.slice(0, 1) ?? '我'}
              </div>
              <button
                type="button"
                aria-label="更换头像"
                className="absolute -right-1 -bottom-1 flex size-10 items-center justify-center rounded-full bg-background shadow-(--shadow-xxs)"
              >
                <Camera className="size-4" />
              </button>
            </div>
            <div className="min-w-0 flex-1 divide-y divide-foreground/4">
              <div className="flex items-start justify-between pb-4">
                <div>
                  <div className="text-xs text-foreground/55">名称</div>
                  <div className="mt-1 text-[15px]">{profile?.name || '未设置'}</div>
                  <div className="mt-1 text-xs text-foreground/55">
                    你的姓名在你通过共享链接和电子邮件与他人共享的文档中可见。
                  </div>
                </div>
                <EditIcon />
              </div>
              <div className="flex items-start justify-between pt-4">
                <div>
                  <div className="text-xs text-foreground/55">电子邮件</div>
                  <div className="mt-1 text-[15px]">{profile?.email || '—'}</div>
                  <div className="mt-1 text-xs text-foreground/55">你用于此帐户的电子邮件地址。</div>
                </div>
                <EditIcon />
              </div>
            </div>
          </RowCard>
          <RowCard className="px-4 py-3">
            <button
              type="button"
              onClick={() => logout()}
              className="text-[13px] font-medium text-(--craft-accent)"
            >
              退出登录
            </button>
          </RowCard>
          <div className="pt-2">
            <GroupTitle>危险区</GroupTitle>
            <RowCard className="mt-3 px-4 py-3">
              <div className="text-[15px] font-semibold text-destructive">删除帐户</div>
              <div className="mt-1 text-[13px] text-foreground/55">
                删除帐户将永久删除你的所有文档。 此操作无法撤销。
              </div>
            </RowCard>
          </div>
        </div>
      );

    case 'subscription':
      return (
        <RowCard className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="text-xs text-foreground/55">当前方案</div>
            <div className="mt-1 text-[15px]">Free</div>
          </div>
          <EditIcon />
        </RowCard>
      );

    case 'team':
      return (
        <RowCard className="px-4 py-3">
          <button type="button" className="flex items-center gap-2 text-[13px] font-medium text-(--craft-accent)">
            <SquarePlus className="size-4" />
            创建新团队
          </button>
        </RowCard>
      );

    case 'integrations':
      return (
        <RowCard className="px-4 py-3 text-[13px] text-foreground/55">暂无已连接的集成。</RowCard>
      );

    case 'assistant':
      return <RowCard className="px-4 py-3 text-[13px] text-foreground/55">助手未启用。</RowCard>;

    case 'notifications':
      return (
        <div className="space-y-6">
          <div>
            <GroupTitle>评论和提及</GroupTitle>
            <GroupDesc>当你收到新的评论和提及时得到通知。</GroupDesc>
            <RowCard className="mt-3 flex items-center justify-between px-4 py-3">
              <div className="text-[13px] font-medium">电子邮件通知</div>
              <Switch
                checked={notify.comments}
                onCheckedChange={(v) => setNotify((s) => ({ ...s, comments: v === true }))}
                className="data-checked:bg-(--craft-accent)"
              />
            </RowCard>
          </div>
          <div>
            <GroupTitle>提醒</GroupTitle>
            <GroupDesc>当需要提醒时，Craft 会向你发送通知。</GroupDesc>
            <RowCard className="mt-3 flex items-center justify-between px-4 py-3">
              <div className="text-[13px] font-medium">电子邮件通知</div>
              <Switch
                checked={notify.reminders}
                onCheckedChange={(v) => setNotify((s) => ({ ...s, reminders: v === true }))}
                className="data-checked:bg-(--craft-accent)"
              />
            </RowCard>
          </div>
          <div>
            <GroupTitle>每日电子邮件</GroupTitle>
            <GroupDesc>接收当天所有任务和提醒的摘要。你还将收到今天截止的摘要推送通知。</GroupDesc>
            <RowCard className="mt-3 divide-y divide-foreground/4">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-[13px] font-medium">电子邮件通知</div>
                <Switch
                  checked={notify.daily}
                  onCheckedChange={(v) => setNotify((s) => ({ ...s, daily: v === true }))}
                  className="data-checked:bg-(--craft-accent)"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-[13px] font-medium">时间</div>
                <div className="flex w-[150px] items-center justify-between rounded-lg bg-foreground/4 px-3 py-1.5 text-[13px]">
                  08:00
                  <ChevronsUpDown className="size-3.5 text-foreground/45" />
                </div>
              </div>
            </RowCard>
          </div>
          <div>
            <GroupTitle>空间</GroupTitle>
            <GroupDesc>你可以覆盖单个空间的这些设置。</GroupDesc>
            <RowCard className="mt-3 flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <SpaceIcon className="size-6 rounded-md text-[10px]" />
                <div className="text-[13px] font-medium">{spaceName}</div>
              </div>
              <ChevronRight className="size-4 text-foreground/45" />
            </RowCard>
          </div>
        </div>
      );

    case 'about':
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 via-fuchsia-500 to-blue-600 text-2xl font-black text-white">
              C
            </div>
            <div>
              <div className="text-[15px] font-semibold">Craft</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[13px] text-foreground/55">3.6.3</span>
                <button type="button" className="rounded-lg bg-foreground/4 px-3 py-1.5 text-[13px] font-medium">
                  检查更新
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-foreground/4 pt-6">
            <GroupTitle>法律信息</GroupTitle>
            <div className="mt-3 space-y-2 text-[13px] font-medium text-(--craft-accent)">
              <div>条款和条件</div>
              <div>隐私政策</div>
              <div>许可证和开源说明</div>
            </div>
          </div>
          <div className="border-t border-foreground/4 pt-6">
            <GroupTitle>社交媒体</GroupTitle>
            <GroupDesc>对 Craft 的新功能和即将推出的功能感兴趣？ 在 X 上关注我们，第一时间了解最新信息！</GroupDesc>
            <button
              type="button"
              className="mt-3 rounded-lg border border-foreground/8 px-4 py-2 text-[13px] font-medium"
            >
              在 X 上关注 @CraftDocs
            </button>
          </div>
          <div className="border-t border-foreground/4 pt-6">
            <GroupTitle>意见反馈</GroupTitle>
            <GroupDesc>有想法、功能请求或发现了错误？ 请告诉我们，我们会尽快处理！</GroupDesc>
            <button
              type="button"
              className="mt-3 rounded-lg border border-foreground/8 px-4 py-2 text-[13px] font-medium"
            >
              意见反馈
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
