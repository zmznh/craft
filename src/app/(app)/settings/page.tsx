'use client';

import { useEffect, useState, ViewTransition } from 'react';
import { getPreferences, updatePreferences } from '@/actions/user/preferences';

const themeOptions = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '跟随系统' },
];

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

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<{ theme: string; editorFont: string; editorWidth: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPreferences().then(setPrefs).catch(() => setError('无法加载偏好'));
  }, []);

  const handleUpdate = async (patch: Partial<{ theme: string; editorFont: string; editorWidth: string }>) => {
    if (!prefs) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try {
      await updatePreferences(patch);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      setError('保存失败');
    }
  };

  if (error) {
    return (
      <ViewTransition>
      <div className="flex flex-1 items-center justify-center">
        <div className="min-h-[560px] w-full max-w-[960px] rounded-2xl border border-border bg-card p-8 shadow-lg">
          <p className="text-ui text-destructive">{error}</p>
        </div>
      </div>
      </ViewTransition>
    );
  }

  if (!prefs) {
    return (
      <ViewTransition>
      <div className="flex flex-1 items-center justify-center">
        <div className="min-h-[560px] w-full max-w-[960px] rounded-2xl border border-border bg-card p-8 shadow-lg">
          <p className="text-ui text-foreground/40">加载中...</p>
        </div>
      </div>
      </ViewTransition>
    );
  }

  const sections = [
    { key: 'theme' as const, title: '主题', options: themeOptions, value: prefs.theme },
    { key: 'editorFont' as const, title: '编辑器字体', options: fontOptions, value: prefs.editorFont },
    { key: 'editorWidth' as const, title: '编辑器宽度', options: widthOptions, value: prefs.editorWidth },
  ];

  const navGroups: { label: string; items: typeof sections }[] = [
    { label: '通用', items: sections.filter(s => s.key === 'theme') },
    { label: '编辑器', items: sections.filter(s => s.key !== 'theme') },
  ];

  return (
    <ViewTransition>
    <div className="flex flex-1 items-start justify-center p-6">
      <div className="flex min-h-[560px] w-full max-w-[960px] overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        {/* 左栏导航 */}
        <aside className="hidden w-[232px] shrink-0 border-r border-border p-6 sm:block">
          <h1 className="mb-4 px-2 text-title font-semibold">设置</h1>
          {navGroups.map(({ label, items }) => (
            <div key={label} className="mb-5">
              <p className="mb-1.5 px-2 text-meta font-semibold text-foreground/40">{label}</p>
              <nav className="flex flex-col gap-0.5">
                {items.map(({ key, title }) => (
                  <button
                    key={key}
                    type="button"
                    data-active={key === 'theme' ? 'true' : undefined}
                    aria-current={key === 'theme' ? 'page' : undefined}
                    className="h-8 rounded-lg px-2 py-1.5 text-left text-ui font-medium text-foreground/85 transition-colors duration-150 hover:bg-foreground/4 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none data-[active=true]:bg-foreground/4"
                  >
                    {title}
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </aside>

        {/* 右栏内容 */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex items-center gap-3">
            <h1 className="text-title font-semibold sm:hidden">设置</h1>
            <p className="ml-auto text-meta text-foreground/40 transition-opacity duration-150" style={{ opacity: saved ? 1 : 0 }}>
              已保存
            </p>
          </div>

          {sections.map(({ key, title, options, value }) => (
            <section key={key} className="mb-8">
              <h2 className="mb-2 text-ui font-medium">{title}</h2>
              <div className="flex flex-wrap gap-2">
                {options.map(({ value: optionValue, label }) => (
                  <button
                    key={optionValue}
                    type="button"
                    onClick={() => handleUpdate({ [key]: optionValue })}
                    aria-pressed={value === optionValue}
                    className={`h-8 rounded-lg px-3 text-ui transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none ${
                      value === optionValue
                        ? 'bg-foreground/4 font-medium text-foreground'
                        : 'text-foreground/55 hover:bg-foreground/4 hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
    </ViewTransition>
  );
}
