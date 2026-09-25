import { describe, expect, it } from 'vitest';
import { RECURRENCE_PRESETS, describeRecurrence, nextOccurrence, parseRecurrence } from './recurrence';

const iso = (date: Date) => date.toISOString();

describe('describeRecurrence', () => {
  it('names each preset rule', () => {
    expect(describeRecurrence('{"freq":"daily"}')).toBe('每天重复');
    expect(describeRecurrence('{"freq":"weekly"}')).toBe('每周重复');
    expect(describeRecurrence('{"freq":"weekly","days":[1,4]}')).toBe('每周：周一、周四');
    expect(describeRecurrence('{"freq":"monthly","byMonthDay":31}')).toBe('每月 31 日重复');
    expect(describeRecurrence('{"freq":"yearly"}')).toBe('每年重复');
  });

  it('returns null without a rule', () => {
    expect(describeRecurrence(null)).toBeNull();
    expect(describeRecurrence('nonsense')).toBeNull();
  });

  it('every preset is a rule the engine accepts', () => {
    for (const preset of RECURRENCE_PRESETS) {
      if (preset.value === null) continue;
      expect(parseRecurrence(preset.value)?.freq).toBeTruthy();
      expect(nextOccurrence(preset.value, new Date('2026-03-10T09:00:00Z'))).not.toBeNull();
    }
  });
});

describe('parseRecurrence', () => {
  it('accepts a JSON rule', () => {
    expect(parseRecurrence('{"freq":"weekly","days":[1,4]}')).toEqual({ freq: 'weekly', days: [1, 4] });
  });

  it('rejects anything unusable', () => {
    expect(parseRecurrence(null)).toBeNull();
    expect(parseRecurrence('')).toBeNull();
    expect(parseRecurrence('nonsense')).toBeNull();
    expect(parseRecurrence('{"freq":"hourly"}')).toBeNull();
    expect(parseRecurrence('{"freq":"weekly","days":["mon"]}')).toBeNull();
  });
});

describe('nextOccurrence', () => {
  it('returns null when there is no rule', () => {
    expect(nextOccurrence(null, new Date('2026-03-10T09:00:00Z'))).toBeNull();
  });

  it('advances daily keeping the wall-clock time', () => {
    expect(iso(nextOccurrence('{"freq":"daily"}', new Date('2026-03-10T09:00:00Z'))!)).toBe(
      '2026-03-11T09:00:00.000Z'
    );
  });

  it('keeps the wall-clock time of the given instant', () => {
    expect(iso(nextOccurrence('{"freq":"daily"}', new Date('2026-03-10T08:59:59Z'))!)).toBe(
      '2026-03-11T08:59:59.000Z'
    );
  });

  it('steps to the next listed weekday', () => {
    // 2026-03-10 is a Tuesday.
    const rule = '{"freq":"weekly","days":[1,4]}';
    expect(nextOccurrence(rule, new Date('2026-03-10T09:00:00Z'))!.getUTCDay()).toBe(4);
    expect(iso(nextOccurrence(rule, new Date('2026-03-12T09:00:00Z'))!)).toBe('2026-03-16T09:00:00.000Z');
  });

  it('repeats the same weekday when no days are listed', () => {
    expect(iso(nextOccurrence('{"freq":"weekly"}', new Date('2026-03-10T09:00:00Z'))!)).toBe(
      '2026-03-17T09:00:00.000Z'
    );
  });

  it('monthly keeps the day of month', () => {
    expect(iso(nextOccurrence('{"freq":"monthly"}', new Date('2026-03-10T09:00:00Z'))!)).toBe(
      '2026-04-10T09:00:00.000Z'
    );
  });

  it('clamps a day of month that the target month does not have', () => {
    const rule = '{"freq":"monthly","byMonthDay":31}';
    expect(iso(nextOccurrence(rule, new Date('2026-01-31T09:00:00Z'))!)).toBe('2026-02-28T09:00:00.000Z');
    expect(iso(nextOccurrence(rule, new Date('2024-01-31T09:00:00Z'))!)).toBe('2024-02-29T09:00:00.000Z');
  });

  it('yearly handles the leap day', () => {
    expect(iso(nextOccurrence('{"freq":"yearly"}', new Date('2024-02-29T09:00:00Z'))!)).toBe(
      '2025-02-28T09:00:00.000Z'
    );
    expect(iso(nextOccurrence('{"freq":"yearly"}', new Date('2025-02-28T09:00:00Z'))!)).toBe(
      '2026-02-28T09:00:00.000Z'
    );
  });

  it('stops at the until bound', () => {
    const rule = '{"freq":"daily","until":"2026-03-11T23:59:59Z"}';
    expect(iso(nextOccurrence(rule, new Date('2026-03-10T09:00:00Z'))!)).toBe('2026-03-11T09:00:00.000Z');
    expect(nextOccurrence(rule, new Date('2026-03-11T09:00:00Z'))).toBeNull();
  });

  it('respects the time zone when the due time is stored as wall clock', () => {
    // 09:00 in Shanghai is 01:00Z; the next daily occurrence must stay 09:00 local.
    const from = new Date('2026-03-10T01:00:00Z');
    const next = nextOccurrence('{"freq":"daily"}', from, 'Asia/Shanghai')!;
    expect(iso(next)).toBe('2026-03-11T01:00:00.000Z');
  });

  it('crosses a daylight-saving boundary without drifting the local time', () => {
    // 2026-03-08 is the US spring-forward date; 09:00 local stays 09:00 after it.
    const next = nextOccurrence('{"freq":"daily"}', new Date('2026-03-07T14:00:00Z'), 'America/New_York')!;
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(next);
    expect(parts.find((p) => p.type === 'hour')?.value).toBe('09');
    expect(next.getUTCDate()).toBe(8);
  });
});
