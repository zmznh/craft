'use client';

import { useEffect, useState } from 'react';
import {
  Bell,
  ChevronDown,
  Circle,
  CirclePlus,
  Compass,
  Globe,
  Hash,
  Info,
  Paintbrush,
  Plug,
  Settings2,
  SlidersHorizontal,
  Users,
  UserRound,
  X,
} from 'lucide-react';
import { useSettingsStore, type SettingsSection } from '@/lib/store/use-settings-store';
import { getProfile } from '@/actions/user/profile';
import { SettingsPanel } from './SettingsPanels';
import { cn } from 'cn';

interface NavItem {
  key: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_GROUPS: { title: string | null; items: NavItem[] }[] = [
  {
    title: '空间设置',
    items: [
      { key: 'published', label: '已发布内容', icon: Compass },
      { key: 'tags', label: '标签', icon: Hash },
      { key: 'space', label: '空间设置', icon: Settings2 },
    ],
  },
  {
    title: '常规设置',
    items: [
      { key: 'appearance', label: '外观', icon: Paintbrush },
      { key: 'language', label: '语言', icon: Globe },
      { key: 'advanced', label: '高级设置', icon: SlidersHorizontal },
    ],
  },
  {
    title: null,
    items: [
      { key: 'account', label: '账户设置', icon: UserRound },
      { key: 'subscription', label: '我的订阅', icon: CirclePlus },
      { key: 'team', label: '团队', icon: Users },
      { key: 'integrations', label: '集成', icon: Plug },
      { key: 'assistant', label: '助手', icon: Circle },
      { key: 'notifications', label: '通知', icon: Bell },
    ],
  },
];

const SECTION_TITLES: Record<SettingsSection, string> = {
  published: '已发布内容',
  tags: '标签',
  space: '空间设置',
  appearance: '外观',
  language: '语言',
  advanced: '高级设置',
  account: '我的账户',
  subscription: '我的订阅',
  team: '我的团队',
  integrations: '集成',
  assistant: '助手',
  notifications: '通知',
  about: '关于 Craft',
};

export function SettingsModal() {
  const open = useSettingsStore((s) => s.open);
  const section = useSettingsStore((s) => s.section);
  const close = useSettingsStore((s) => s.close);
  const setSection = useSettingsStore((s) => s.setSection);
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    getProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  const spaceName = profile?.name ? `${profile.name} 的空间` : '我的空间';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/16" onClick={close} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="设置"
        className="relative flex h-[594px] w-[960px] max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-background shadow-(--shadow-md)"
      >
        <nav className="w-[280px] shrink-0 overflow-y-auto pt-4 pb-3" aria-label="设置导航">
          <div className="px-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div
                  className="flex size-24 items-center justify-center rounded-[22px] text-3xl font-semibold text-white"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, rgb(255 255 255 / .16) 0 20px, rgb(255 255 255 / 0) 20px 52px), linear-gradient(to bottom right, #d33bf0, #7e22ce)',
                  }}
                >
                  {spaceName.slice(0, 2)}
                </div>
                <span className="absolute -bottom-1.5 right-0 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
                  Free
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[15px] font-semibold">
                {spaceName}
                <ChevronDown className="size-4 text-foreground/60" />
              </div>
            </div>
            <div
              className="mt-5 rounded-xl p-3"
              style={{
                backgroundImage:
                  'radial-gradient(56px 22px at 18% 32%, rgb(255 255 255 / .85), transparent 70%), radial-gradient(72px 26px at 78% 18%, rgb(255 255 255 / .75), transparent 70%), radial-gradient(64px 24px at 55% 80%, rgb(255 255 255 / .6), transparent 70%), linear-gradient(135deg, #b9dcef, #dceef8)',
              }}
            >
              <div className="flex items-center gap-1.5 text-[13px] font-black tracking-widest">
                CRAFT
                <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
                  PLUS
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-4 text-foreground/60">
                一个功能齐全的帐户。获取无限内容和存储空间，记录你的所有创意。
              </p>
            </div>
          </div>

          {NAV_GROUPS.map((group, groupIndex) => (
            <div key={groupIndex} className={cn('px-5', groupIndex === 0 ? 'mt-6' : 'mt-6')}>
              {group.title ? (
                <div className="px-2 pb-1.5 text-xs font-semibold">{group.title}</div>
              ) : (
                <div className="flex items-center gap-2.5 px-2 pb-1.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 text-[13px] font-semibold text-white">
                    {profile?.name?.slice(0, 1) ?? '我'}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold">{profile?.name ?? '未登录'}</div>
                    <div className="truncate text-xs text-foreground/55">{profile?.email ?? ''}</div>
                  </div>
                </div>
              )}
              <div className="space-y-0">
                {group.items.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSection(key)}
                    aria-current={section === key ? 'true' : undefined}
                    className={cn(
                      'flex h-8 w-[232px] items-center gap-2 rounded-[10px] px-2 text-[13px] font-medium text-foreground/85 transition-colors',
                      'hover:bg-foreground/4',
                      section === key && 'bg-foreground/8 text-foreground hover:bg-foreground/8'
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-foreground/70" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-8 px-5">
            <button
              type="button"
              onClick={() => setSection('about')}
              aria-current={section === 'about' ? 'true' : undefined}
              className={cn(
                'flex h-8 w-[232px] items-center gap-2 rounded-[10px] px-2 text-[13px] font-medium text-foreground/85 transition-colors',
                'hover:bg-foreground/4',
                section === 'about' && 'bg-foreground/8 text-foreground hover:bg-foreground/8'
              )}
            >
              <Info className="size-4 shrink-0 text-foreground/70" />
              <span>关于 Craft</span>
            </button>
          </div>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col border-l border-foreground/4">
          <header className="flex h-14 shrink-0 items-center justify-between pl-6 pr-5">
            <h2 className="text-[15px] font-semibold">{SECTION_TITLES[section]}</h2>
            <button
              type="button"
              onClick={close}
              aria-label="关闭"
              className="flex size-6 items-center justify-center rounded-full bg-foreground/16 text-background transition-colors hover:bg-foreground/24"
            >
              <X className="size-3.5" />
            </button>
          </header>
          <div className="border-t border-foreground/4" />
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <SettingsPanel section={section} profile={profile} spaceName={spaceName} />
          </div>
        </div>
      </div>
    </div>
  );
}
