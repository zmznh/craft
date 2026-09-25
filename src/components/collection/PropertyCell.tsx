'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from 'cn';

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

export function PropertyCell({ property, value, onChange }: PropertyCellProps) {
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

// ─── Helpers ─────────────────────────────────────────
interface SelectOption {
  id: string;
  label: string;
  color: string;
}

function getSelectOptions(config: string | null): SelectOption[] {
  if (!config) return [];
  try {
    const parsed = typeof config === 'string' ? JSON.parse(config) : config;
    return parsed.options ?? [];
  } catch {
    return [];
  }
}
