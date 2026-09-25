import { describe, expect, it } from 'vitest';
import { renderMath, stripMathDelimiters } from './render';

describe('renderMath', () => {
  it('renders a valid expression to KaTeX markup', () => {
    const { html, empty } = renderMath('\\frac{a}{b}');
    expect(empty).toBe(false);
    expect(html).toContain('katex');
    expect(html).toContain('frac');
  });

  it('marks blank input as empty instead of rendering a box', () => {
    expect(renderMath('   ')).toEqual({ html: '', empty: true });
  });

  it('keeps malformed input renderable and flags it in the markup', () => {
    const { html, empty } = renderMath('\\frac{1}{');
    expect(empty).toBe(false);
    expect(html).toContain('katex-error');
  });

  it('switches to display mode without throwing', () => {
    expect(renderMath('x^2', true).html).toContain('katex-display');
  });
});

describe('stripMathDelimiters', () => {
  it.each([
    ['$$\\alpha$$', '\\alpha'],
    ['$\\alpha$', '\\alpha'],
    ['  \\alpha  ', '\\alpha'],
    ['\\alpha + \\beta', '\\alpha + \\beta'],
  ])('normalizes %j', (input, expected) => {
    expect(stripMathDelimiters(input)).toBe(expected);
  });
});
