'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronDown, Calendar as CalendarIcon, Link2, Paperclip } from 'lucide-react';
import { cn } from 'cn';
import { evaluateFormula } from '@/lib/collection/formula';
import { getCollection } from '@/actions/collection/collection';
import { uploadFile } from '@/lib/upload-client';

interface Property {
  id: string;
  name: string;
  type: string;
  config: string | null;
  order: number;
  isVisible: boolean;
}

interface PropertyCellProps {
  property: Property;
  value: any;
  onChange: (value: any) => void;
  /** The row this cell belongs to; carries the timestamps formula and date columns read. */
  item?: { createdAt?: string; updatedAt?: string; values?: { propertyId: string; value: unknown }[] };
  /** Needed to turn `{属性名}` references into values. */
  properties?: Property[];
}

function parseValue(raw: any): any {
  if (raw == null || raw === '') return null;
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function PropertyCell({ property, value, onChange, item, properties }: PropertyCellProps) {
  const parsed = parseValue(value);

  switch (property.type) {
    case 'number':
      return <NumberCell value={parsed} onChange={onChange} />;
    case 'checkbox':
      return <CheckboxCell value={parsed} onChange={onChange} />;
    case 'date':
      return <DateCell value={parsed} onChange={onChange} />;
    case 'select':
      return <SelectCell property={property} value={parsed} onChange={onChange} />;
    case 'multi_select':
      return <MultiSelectCell property={property} value={parsed} onChange={onChange} />;
    case 'url':
      return <URLCell value={parsed} onChange={onChange} />;
    case 'email':
      return <EmailCell value={parsed} onChange={onChange} />;
    case 'formula':
      return <FormulaCell property={property} item={item} properties={properties} />;
    case 'created_at':
      return <TimestampCell value={item?.createdAt} />;
    case 'updated_at':
      return <TimestampCell value={item?.updatedAt} />;
    case 'file':
      return <FileCell value={parsed} onChange={onChange} />;
    case 'relation':
      return <RelationCell property={property} value={parsed} onChange={onChange} />;
    default:
      return <TextCell value={parsed} onChange={onChange} />;
  }
}

export function CellDisplay({ value }: { value: any }) {
  const parsed = parseValue(value);
  if (parsed == null || parsed === '') return <span className="text-muted-foreground/50">-</span>;
  if (typeof parsed === 'boolean') {
    return <span>{parsed ? '✓' : ''}</span>;
  }
  if (Array.isArray(parsed)) {
    return <span>{parsed.join(', ')}</span>;
  }
  return <span>{String(parsed)}</span>;
}

// ─── Text ────────────────────────────────────────────
function TextCell({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value ?? '');
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  if (!editing) {
    return (
      <div className="min-h-8 cursor-pointer px-2 py-1 transition-colors duration-150 hover:bg-foreground/[0.03]" onClick={() => setEditing(true)}>
        <span className="text-ui">{value || <span className="text-muted-foreground/50">-</span>}</span>
      </div>
    );
  }

  return (
    <input
      ref={ref}
      type="text"
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={() => { setEditing(false); onChange(text); }}
      onKeyDown={e => {
        if (e.key === 'Enter') { setEditing(false); onChange(text); }
        if (e.key === 'Escape') { setText(value ?? ''); setEditing(false); }
      }}
      className="w-full rounded-md border border-craft-accent bg-background px-1 py-0.5 text-ui outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    />
  );
}

// ─── Number ──────────────────────────────────────────
function NumberCell({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value != null ? String(value) : '');
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  if (!editing) {
    return (
      <div className="min-h-8 cursor-pointer px-2 py-1 transition-colors duration-150 hover:bg-foreground/[0.03]" onClick={() => setEditing(true)}>
        <span className="text-ui tabular-nums">{value != null ? String(value) : <span className="text-muted-foreground/50">-</span>}</span>
      </div>
    );
  }

  return (
    <input
      ref={ref}
      type="number"
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={() => { setEditing(false); const n = parseFloat(text); onChange(isNaN(n) ? null : n); }}
      onKeyDown={e => {
        if (e.key === 'Enter') { const n = parseFloat(text); onChange(isNaN(n) ? null : n); setEditing(false); }
        if (e.key === 'Escape') { setText(value != null ? String(value) : ''); setEditing(false); }
      }}
      className="w-full rounded-md border border-craft-accent bg-background px-1 py-0.5 text-ui tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    />
  );
}

// ─── Checkbox ────────────────────────────────────────
function CheckboxCell({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  return (
    <div className="flex min-h-8 items-center px-2 py-1">
      <button
        onClick={() => onChange(!value)}
        className={cn(
          'flex size-4 items-center justify-center rounded-md border transition-colors duration-150',
          value
            ? 'border-craft-accent bg-craft-accent text-white'
            : 'border-foreground/25 hover:border-craft-accent'
        )}
      >
        {value && <Check className="size-3" />}
      </button>
    </div>
  );
}

// ─── Date ────────────────────────────────────────────
function DateCell({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value ?? '');
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  if (!editing) {
    return (
      <div className="min-h-8 cursor-pointer px-2 py-1 transition-colors duration-150 hover:bg-foreground/[0.03]" onClick={() => { setText(value ?? ''); setEditing(true); }}>
        <span className="text-ui">{value || <span className="text-muted-foreground/50">-</span>}</span>
      </div>
    );
  }

  return (
    <input
      ref={ref}
      type="date"
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={() => { setEditing(false); onChange(text || null); }}
      onKeyDown={e => {
        if (e.key === 'Enter') { setEditing(false); onChange(text || null); }
        if (e.key === 'Escape') { setEditing(false); }
      }}
      className="w-full rounded-md border border-craft-accent bg-background px-1 py-0.5 text-ui outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    />
  );
}

// ─── Select ──────────────────────────────────────────
function SelectCell({ property, value, onChange }: { property: Property; value: any; onChange: (v: any) => void }) {
  const [open, setOpen] = useState(false);
  const options = getSelectOptions(property.config);

  const selected = options.find(o => o.id === value);

  return (
    <div className="relative min-h-8 px-2 py-1">
      <button
        className="flex w-full items-center gap-1 text-left text-ui transition-colors duration-150 hover:text-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        onClick={() => setOpen(!open)}
      >
        {selected ? (
          <span
            className="rounded-md px-2 py-0.5 text-ui font-medium"
            style={{ backgroundColor: selected.color + '20', color: selected.color }}
          >
            {selected.label}
          </span>
        ) : (
          <span className="text-muted-foreground/50">-</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-lg">
            {options.map(option => (
              <button
                key={option.id}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-ui transition-colors duration-150 hover:bg-foreground/4"
                onClick={() => { onChange(option.id); setOpen(false); }}
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
                <span>{option.label}</span>
                {value === option.id && <Check className="ml-auto size-3" />}
              </button>
            ))}
            <button
              className="flex w-full items-center rounded-md px-2 py-1.5 text-ui text-foreground/40 transition-colors duration-150 hover:bg-foreground/4 hover:text-foreground"
              onClick={() => { onChange(null); setOpen(false); }}
            >
              清除
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Multi Select ────────────────────────────────────
function MultiSelectCell({ property, value, onChange }: { property: Property; value: any; onChange: (v: any) => void }) {
  const [open, setOpen] = useState(false);
  const options = getSelectOptions(property.config);
  const selected: string[] = Array.isArray(value) ? value : [];

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter(s => s !== id)
      : [...selected, id];
    onChange(next.length > 0 ? next : null);
  };

  return (
    <div className="relative min-h-8 px-2 py-1">
      <button
        className="flex w-full flex-wrap items-center gap-1 text-left text-ui transition-colors duration-150 hover:text-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        onClick={() => setOpen(!open)}
      >
        {selected.length > 0 ? (
          selected.map(id => {
            const opt = options.find(o => o.id === id);
            if (!opt) return null;
            return (
              <span
                key={id}
                className="rounded-md px-2 py-0.5 text-ui font-medium"
                style={{ backgroundColor: opt.color + '20', color: opt.color }}
              >
                {opt.label}
              </span>
            );
          })
        ) : (
          <span className="text-muted-foreground/50">-</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-lg">
            {options.map(option => (
              <button
                key={option.id}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-ui transition-colors duration-150 hover:bg-foreground/4"
                onClick={() => toggle(option.id)}
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
                <span>{option.label}</span>
                {selected.includes(option.id) && <Check className="ml-auto size-3" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── URL ─────────────────────────────────────────────
function URLCell({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value ?? '');
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  if (!editing) {
    return (
      <div className="min-h-8 cursor-pointer px-2 py-1 transition-colors duration-150 hover:bg-foreground/[0.03]" onClick={() => setEditing(true)}>
        {value ? (
          <a
            href={String(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ui text-craft-accent underline-offset-4 hover:underline"
            onClick={e => e.stopPropagation()}
          >
            {String(value).replace(/^https?:\/\//, '').slice(0, 40)}
          </a>
        ) : (
          <span className="text-muted-foreground/50">-</span>
        )}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      type="url"
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={() => { setEditing(false); onChange(text || null); }}
      onKeyDown={e => {
        if (e.key === 'Enter') { setEditing(false); onChange(text || null); }
        if (e.key === 'Escape') { setText(value ?? ''); setEditing(false); }
      }}
      className="w-full rounded-md border border-craft-accent bg-background px-1 py-0.5 text-ui outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    />
  );
}

// ─── Email ───────────────────────────────────────────
function EmailCell({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value ?? '');
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  if (!editing) {
    return (
      <div className="min-h-8 cursor-pointer px-2 py-1 transition-colors duration-150 hover:bg-foreground/[0.03]" onClick={() => setEditing(true)}>
        {value ? (
          <a
            href={`mailto:${String(value)}`}
            className="text-ui text-craft-accent underline-offset-4 hover:underline"
            onClick={e => e.stopPropagation()}
          >
            {String(value)}
          </a>
        ) : (
          <span className="text-muted-foreground/50">-</span>
        )}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      type="email"
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={() => { setEditing(false); onChange(text || null); }}
      onKeyDown={e => {
        if (e.key === 'Enter') { setEditing(false); onChange(text || null); }
        if (e.key === 'Escape') { setText(value ?? ''); setEditing(false); }
      }}
      className="w-full rounded-md border border-craft-accent bg-background px-1 py-0.5 text-ui outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    />
  );
}

// ─── Formula ─────────────────────────────────────────
function FormulaCell({
  property,
  item,
  properties,
}: {
  property: Property;
  item?: PropertyCellProps['item'];
  properties?: Property[];
}) {
  const expression = readConfig(property.config)?.expression ?? '';
  const row: Record<string, unknown> = {};
  for (const value of item?.values ?? []) {
    const named = properties?.find((candidate) => candidate.id === value.propertyId);
    if (named) row[named.name] = parseValue(value.value);
  }

  const result = expression ? evaluateFormula(expression, row) : { ok: false as const, error: '未设置公式' };

  return (
    <div className="min-h-[32px] px-2 py-1 text-sm tabular-nums">
      {result.ok ? (
        <span>{formatNumber(result.value)}</span>
      ) : (
        <span className="text-muted-foreground/60">{result.error}</span>
      )}
    </div>
  );
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 10000) / 10000);
}

// ─── Created / Updated ───────────────────────────────
function TimestampCell({ value }: { value?: string }) {
  const date = value ? new Date(value) : null;
  return (
    <div className="min-h-[32px] px-2 py-1 text-sm">
      {date && !Number.isNaN(date.getTime()) ? (
        <span className="text-muted-foreground">{date.toLocaleDateString('zh-CN')}</span>
      ) : (
        <span className="text-muted-foreground/50">-</span>
      )}
    </div>
  );
}

// ─── File ────────────────────────────────────────────
interface FileValue {
  name: string;
  url: string;
  size?: number;
}

function FileCell({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const file: FileValue | null =
    value && typeof value === 'object' ? (value as FileValue) : null;

  return (
    <div className="flex min-h-[32px] items-center gap-1 px-2 py-1">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={async (event) => {
          const picked = event.target.files?.[0];
          if (!picked) return;
          setBusy(true);
          try {
            const { url } = await uploadFile(picked);
            onChange({ name: picked.name, url, size: picked.size });
          } finally {
            setBusy(false);
            event.target.value = '';
          }
        }}
      />
      {file ? (
        <>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
          >
            <Paperclip className="size-3.5 shrink-0" />
            <span className="truncate">{file.name}</span>
          </a>
          <button
            className="ml-auto text-muted-foreground hover:text-destructive"
            aria-label="移除附件"
            onClick={() => onChange(null)}
          >
            <X className="size-3.5" />
          </button>
        </>
      ) : (
        <button
          className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? '上传中…' : '添加文件'}
        </button>
      )}
    </div>
  );
}

// ─── Relation ────────────────────────────────────────
function RelationCell({
  property,
  value,
  onChange,
}: {
  property: Property;
  value: any;
  onChange: (v: any) => void;
}) {
  const targetId = readConfig(property.config)?.collectionId ?? null;
  const selected: string[] = Array.isArray(value) ? value : [];
  const [options, setOptions] = useState<{ id: string; label: string }[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!targetId) return;
    let alive = true;
    getCollection(targetId)
      .then((collection) => {
        if (!alive || !collection) return;
        const properties = collection.properties as any[];
        const items = collection.items as any[];
        const primary = properties.find((candidate) => candidate.type === 'text') ?? properties[0];
        setOptions(
          items.map((item) => ({
            id: item.id,
            label:
              String(
                parseValue(item.values?.find((entry: any) => entry.propertyId === primary?.id)?.value) ?? ''
              ) || '未命名',
          }))
        );
      })
      .catch(() => setOptions([]));
    return () => {
      alive = false;
    };
  }, [targetId]);

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((entry) => entry !== id) : [...selected, id];
    onChange(next.length ? next : null);
  };

  return (
    <div className="relative min-h-[32px] px-2 py-1">
      <button
        className="flex w-full flex-wrap items-center gap-1 text-left text-sm"
        disabled={!targetId}
        onClick={() => setOpen(!open)}
      >
        {selected.length ? (
          selected.map((id) => (
            <span key={id} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {options.find((option) => option.id === id)?.label ?? '已链接项'}
            </span>
          ))
        ) : (
          <span className="text-muted-foreground/50">{targetId ? '-' : '未配置关联集合'}</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 max-h-60 w-56 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
            {options.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">目标集合还没有条目</p>
            )}
            {options.map((option) => (
              <button
                key={option.id}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
                onClick={() => toggle(option.id)}
              >
                <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {selected.includes(option.id) && <Check className="size-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────
interface SelectOption {
  id: string;
  label: string;
  color: string;
}

function readConfig(config: string | null): Record<string, any> | null {
  if (!config) return null;
  try {
    const parsed = typeof config === 'string' ? JSON.parse(config) : config;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function getSelectOptions(config: string | null): SelectOption[] {
  return readConfig(config)?.options ?? [];
}
