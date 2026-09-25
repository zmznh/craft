import { describe, expect, it } from 'vitest';
import { evaluateFormula } from './formula';

const row = { 价格: 12, 数量: 3, 折扣: 0.5, 名称: '苹果' };

describe('evaluateFormula', () => {
  it('evaluates arithmetic', () => {
    expect(evaluateFormula('1 + 2 * 3')).toEqual({ ok: true, value: 7 });
    expect(evaluateFormula('(1 + 2) * 3')).toEqual({ ok: true, value: 9 });
    expect(evaluateFormula('7 / 2')).toEqual({ ok: true, value: 3.5 });
    expect(evaluateFormula('-4 + 1')).toEqual({ ok: true, value: -3 });
  });

  it('reads named properties out of the row', () => {
    expect(evaluateFormula('{价格} * {数量}', row)).toEqual({ ok: true, value: 36 });
    expect(evaluateFormula('{价格} * {数量} * (1 - {折扣})', row)).toEqual({ ok: true, value: 18 });
  });

  it('applies the whitelisted functions', () => {
    expect(evaluateFormula('MIN(3, 7, 1)')).toEqual({ ok: true, value: 1 });
    expect(evaluateFormula('MAX(3, 7)')).toEqual({ ok: true, value: 7 });
    expect(evaluateFormula('SUM(1, 2, 3)')).toEqual({ ok: true, value: 6 });
    expect(evaluateFormula('ROUND(1.235, 2)')).toEqual({ ok: true, value: 1.24 });
    expect(evaluateFormula('ABS(-2) * {数量}', row)).toEqual({ ok: true, value: 6 });
  });

  it('refuses a missing or non-numeric reference', () => {
    expect(evaluateFormula('{不存在} + 1', row).ok).toBe(false);
    expect(evaluateFormula('{名称} + 1', row).ok).toBe(false);
  });

  it('refuses anything outside the language instead of evaluating it', () => {
    expect(evaluateFormula('alert(1)').ok).toBe(false);
    expect(evaluateFormula('1 +').ok).toBe(false);
    expect(evaluateFormula('a; drop').ok).toBe(false);
    expect(evaluateFormula('1 / 0').ok).toBe(false);
    expect(evaluateFormula('').ok).toBe(false);
  });
});
