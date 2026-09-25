'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { getPreferences, updatePreferences } from '@/actions/user/preferences';
import { AppPageContainer } from '@/components/app/AppPageContainer';
import { AppPageHeader } from '@/components/app/AppPageHeader';

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
  const { setTheme } = useTheme();
  const [prefs, setPrefs] = useState<{ theme: string; editorFont: string; editorWidth: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPreferences().then(setPrefs).catch(() => setError('无法加载偏好'));
  }, []);

  const handleUpdate = async (patch: Partial<{ theme: string; editorFont: string; editorWidth: string }>) => {
    if (!prefs) return;
    const next = { ...prefs, ...patch };
    if (patch.theme) setTheme(patch.theme);
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
      <div className="flex flex-1 flex-col overflow-y-auto">
        <AppPageHeader title="设置" />
        <AppPageContainer className="max-w-2xl text-sm text-destructive">{error}</AppPageContainer>
      </div>
    );
  }

  if (!prefs) {
    return (
      <div className="flex flex-1 flex-col overflow-y-auto">
        <AppPageHeader title="设置" />
        <AppPageContainer className="max-w-2xl text-sm text-muted-foreground">加载中...</AppPageContainer>
      </div>
    );
  }

  const groups = [
    { key: 'theme' as const, title: '主题', options: themeOptions, value: prefs.theme },
    { key: 'editorFont' as const, title: '编辑器字体', options: fontOptions, value: prefs.editorFont },
    { key: 'editorWidth' as const, title: '编辑器宽度', options: widthOptions, value: prefs.editorWidth },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <AppPageHeader title="设置" />
      <AppPageContainer className="max-w-2xl space-y-8">
        {saved && <p className="text-xs text-muted-foreground">已保存</p>}
        {groups.map(({ key, title, options, value }) => (
          <section key={key}>
            <h2 className="mb-2 text-sm font-medium">{title}</h2>
            <div className="flex flex-wrap gap-2">
              {options.map(({ value: optionValue, label }) => (
                <button
                  key={optionValue}
                  type="button"
                  onClick={() => handleUpdate({ [key]: optionValue })}
                  aria-pressed={value === optionValue}
                  className={`rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted ${
                    value === optionValue ? 'bg-muted font-medium' : ''
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        ))}
      </AppPageContainer>
    </div>
  );
}
