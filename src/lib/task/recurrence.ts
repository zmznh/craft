export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  freq: RecurrenceFrequency;
  /** Weekly: 0 = Sunday through 6 = Saturday. */
  days?: number[];
  /** Monthly: 1 to 31, clamped to the length of the target month. */
  byMonthDay?: number;
  /** Inclusive upper bound, ISO date or datetime. */
  until?: string;
}

const FREQUENCIES: RecurrenceFrequency[] = ['daily', 'weekly', 'monthly', 'yearly'];

export function parseRecurrence(raw: string | null | undefined): RecurrenceRule | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;

  const rule = parsed as Record<string, unknown>;
  if (typeof rule.freq !== 'string' || !FREQUENCIES.includes(rule.freq as RecurrenceFrequency)) return null;

  if (rule.days !== undefined) {
    if (!Array.isArray(rule.days) || !rule.days.every((day) => isWeekdayNumber(day))) return null;
  }
  if (rule.byMonthDay !== undefined && !(Number.isInteger(rule.byMonthDay) && (rule.byMonthDay as number) >= 1 && (rule.byMonthDay as number) <= 31)) {
    return null;
  }
  if (rule.until !== undefined && typeof rule.until !== 'string') return null;

  const result: RecurrenceRule = { freq: rule.freq as RecurrenceFrequency };
  if (Array.isArray(rule.days)) result.days = rule.days as number[];
  if (rule.byMonthDay !== undefined) result.byMonthDay = rule.byMonthDay as number;
  if (typeof rule.until === 'string') result.until = rule.until;
  return result;
}

function isWeekdayNumber(value: unknown): boolean {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 6;
}

const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function describeRecurrence(raw: string | null | undefined): string | null {
  const rule = parseRecurrence(raw);
  if (!rule) return null;
  if (rule.freq === 'weekly') {
    if (!rule.days?.length) return '每周重复';
    return `每周：${rule.days.map((day) => WEEKDAY_LABELS[day] ?? '').filter(Boolean).join('、')}`;
  }
  if (rule.freq === 'monthly') {
    return rule.byMonthDay ? `每月 ${rule.byMonthDay} 日重复` : '每月重复';
  }
  if (rule.freq === 'yearly') return '每年重复';
  return '每天重复';
}

/** The preset rules the task scheduler offers; the value is the stored JSON text. */
export const RECURRENCE_PRESETS: { label: string; value: string | null }[] = [
  { label: '不重复', value: null },
  { label: '每天', value: '{"freq":"daily"}' },
  { label: '每周', value: '{"freq":"weekly"}' },
  { label: '每月', value: '{"freq":"monthly"}' },
  { label: '每年', value: '{"freq":"yearly"}' },
];

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function wallOf(date: Date, timeZone: string): WallClock {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');

  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
    hour: pick('hour'),
    minute: pick('minute'),
    second: pick('second'),
  };
}

/** Milliseconds the zone is ahead of UTC at that instant; two passes settle a DST edge. */
function zoneOffsetAt(timeZone: string, instant: Date): number {
  const wall = wallOf(instant, timeZone);
  return Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second) - instant.getTime();
}

function wallToInstant(wall: WallClock, timeZone: string): number {
  const asUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second);
  const firstPass = asUtc - zoneOffsetAt(timeZone, new Date(asUtc));
  return asUtc - zoneOffsetAt(timeZone, new Date(firstPass));
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function clampDay(year: number, month: number, day: number): number {
  return Math.min(day, daysInMonth(year, month));
}

function untilBound(rule: RecurrenceRule, timeZone: string): number | null {
  if (!rule.until) return null;
  const stamp = Date.parse(rule.until);
  if (Number.isNaN(stamp)) return null;
  // A bare date means "through the end of that day", in the task's own zone.
  if (/^\d{4}-\d{2}-\d{2}$/.test(rule.until)) {
    const [year, month, day] = rule.until.split('-').map(Number);
    return wallToInstant({ year, month, day, hour: 23, minute: 59, second: 59 }, timeZone) + 999;
  }
  return stamp;
}

/**
 * The occurrence strictly after `from`, kept on the zone's wall clock so a task
 * due at 09:00 stays at 09:00 across month ends and daylight-saving changes.
 */
export function nextOccurrence(
  raw: string | null | undefined,
  from: Date,
  timeZone = 'UTC',
): Date | null {
  const rule = parseRecurrence(raw);
  if (!rule) return null;

  const base = wallOf(from, timeZone);
  let candidate: WallClock | null = null;

  if (rule.freq === 'daily') {
    candidate = addDays(base, 1);
  } else if (rule.freq === 'weekly') {
    const wanted = rule.days?.length ? new Set(rule.days) : new Set([weekdayOf(base, timeZone)]);
    for (let offset = 1; offset <= 8; offset += 1) {
      const probe = addDays(base, offset);
      if (wanted.has(weekdayOf(probe, timeZone))) {
        candidate = probe;
        break;
      }
    }
  } else if (rule.freq === 'monthly') {
    const wanted = rule.byMonthDay ?? base.day;
    for (let offset = 1; offset <= 24; offset += 1) {
      const probe = addMonths(base, offset);
      probe.day = clampDay(probe.year, probe.month, wanted);
      const instant = wallToInstant(probe, timeZone);
      if (instant > from.getTime()) {
        candidate = probe;
        break;
      }
    }
  } else {
    for (let offset = 1; offset <= 4; offset += 1) {
      const probe = { ...base, year: base.year + offset };
      probe.day = clampDay(probe.year, probe.month, probe.day);
      if (wallToInstant(probe, timeZone) > from.getTime()) {
        candidate = probe;
        break;
      }
    }
  }

  if (!candidate) return null;
  const instant = wallToInstant(candidate, timeZone);
  if (instant <= from.getTime()) return null;

  const bound = untilBound(rule, timeZone);
  if (bound !== null && instant > bound) return null;

  return new Date(instant);
}

function weekdayOf(wall: WallClock, timeZone: string): number {
  return new Date(wallToInstant(wall, timeZone)).getUTCDay();
}

function addDays(wall: WallClock, days: number): WallClock {
  const date = new Date(Date.UTC(wall.year, wall.month - 1, wall.day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: wall.hour,
    minute: wall.minute,
    second: wall.second,
  };
}

function addMonths(wall: WallClock, months: number): WallClock {
  const total = wall.month - 1 + months;
  return {
    year: wall.year + Math.floor(total / 12),
    month: (total % 12) + 1,
    day: wall.day,
    hour: wall.hour,
    minute: wall.minute,
    second: wall.second,
  };
}
