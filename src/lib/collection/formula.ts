export type FormulaResult = { ok: true; value: number } | { ok: false; error: string };

type Token =
  | { kind: 'number'; value: number }
  | { kind: 'ref'; name: string }
  | { kind: 'name'; name: string }
  | { kind: 'op'; value: string };

const FUNCTIONS: Record<string, (args: number[]) => number> = {
  min: (args) => Math.min(...args),
  max: (args) => Math.max(...args),
  sum: (args) => args.reduce((total, value) => total + value, 0),
  abs: (args) => Math.abs(args[0]),
  round: ([value, digits = 0]) => {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  },
};

/**
 * A deliberately tiny calculator: numbers, `{属性名}` references, the four
 * arithmetic operators, parentheses and a five-function whitelist. Nothing here
 * reaches `eval`, so a formula authored in a shared collection cannot run code.
 */
export function evaluateFormula(expression: string, row: Record<string, unknown> = {}): FormulaResult {
  const tokens = tokenize(expression);
  if (!tokens) return { ok: false, error: '无法识别的表达式' };
  if (!tokens.length) return { ok: false, error: '表达式为空' };

  let position = 0;
  const peek = () => tokens[position];

  const expect = (kind: Token['kind'], value?: string) => {
    const token = tokens[position];
    if (!token || token.kind !== kind || (value && (token as { value?: string }).value !== value)) return null;
    position += 1;
    return token;
  };

  const parseSum = (): number | null => {
    let left = parseProduct();
    if (left === null) return null;
    for (;;) {
      const token = peek();
      if (token?.kind !== 'op' || (token.value !== '+' && token.value !== '-')) return left;
      position += 1;
      const right = parseProduct();
      if (right === null) return null;
      left = token.value === '+' ? left + right : left - right;
    }
  };

  const parseProduct = (): number | null => {
    let left = parseUnary();
    if (left === null) return null;
    for (;;) {
      const token = peek();
      if (token?.kind !== 'op' || (token.value !== '*' && token.value !== '/')) return left;
      position += 1;
      const right = parseUnary();
      if (right === null) return null;
      if (token.value === '/') {
        if (right === 0) return null;
        left /= right;
      } else {
        left *= right;
      }
    }
  };

  const parseUnary = (): number | null => {
    const token = peek();
    if (token?.kind === 'op' && (token.value === '-' || token.value === '+')) {
      position += 1;
      const value = parseUnary();
      return value === null ? null : token.value === '-' ? -value : value;
    }
    return parseAtom();
  };

  const parseAtom = (): number | null => {
    const token = peek();
    if (!token) return null;

    if (token.kind === 'number') {
      position += 1;
      return token.value;
    }

    if (token.kind === 'ref') {
      position += 1;
      const raw = row[token.name];
      const value = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() && Number.isFinite(Number(raw)) ? Number(raw) : null;
      return value === null ? null : value;
    }

    if (token.kind === 'name') {
      const fn = FUNCTIONS[token.name.toLowerCase()];
      position += 1;
      if (!fn || !expect('op', '(')) return null;
      const args: number[] = [];
      if (expect('op', ')')) {
        return fn(args);
      }
      for (;;) {
        const value = parseSum();
        if (value === null) return null;
        args.push(value);
        const next = peek();
        if (next?.kind === 'op' && next.value === ',') {
          position += 1;
          continue;
        }
        if (!expect('op', ')')) return null;
        break;
      }
      return fn(args);
    }

    if (token.kind === 'op' && token.value === '(') {
      position += 1;
      const value = parseSum();
      if (value === null) return null;
      return expect('op', ')') ? value : null;
    }

    return null;
  };

  const value = parseSum();
  if (value === null || position !== tokens.length || !Number.isFinite(value)) {
    return { ok: false, error: '公式无法计算' };
  }
  return { ok: true, value };
}

function tokenize(expression: string): Token[] | null {
  const tokens: Token[] = [];
  const source = expression.trim();
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      const match = /^\d*\.?\d+/.exec(source.slice(index));
      if (!match) return null;
      tokens.push({ kind: 'number', value: Number(match[0]) });
      index += match[0].length;
      continue;
    }

    if (char === '{') {
      const end = source.indexOf('}', index);
      if (end === -1) return null;
      tokens.push({ kind: 'ref', name: source.slice(index + 1, end).trim() });
      index = end + 1;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      const match = /^[A-Za-z_]+/.exec(source.slice(index));
      if (!match) return null;
      tokens.push({ kind: 'name', name: match[0] });
      index += match[0].length;
      continue;
    }

    if ('+-*/(),'.includes(char)) {
      tokens.push({ kind: 'op', value: char });
      index += 1;
      continue;
    }

    return null;
  }

  return tokens;
}
