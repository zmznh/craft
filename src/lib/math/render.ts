import katex from 'katex';

export interface RenderedMath {
  html: string;
  /** KaTeX renders its own errors inline; this is only for the empty-input case. */
  empty: boolean;
}

/**
 * `throwOnError: false` keeps a malformed formula inside the editor instead of
 * throwing out of a render — the author has to be able to see and fix the source.
 */
export function renderMath(latex: string, displayMode = false): RenderedMath {
  if (!latex.trim()) return { html: '', empty: true };

  return {
    html: katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'html',
      errorColor: '#e0596b',
    }),
    empty: false,
  };
}

/** `$$x$$` and `$x$` are what the author typed; the node stores only the body. */
export function stripMathDelimiters(input: string): string {
  const trimmed = input.trim();
  const display = /^\$\$([\s\S]*)\$\$$/.exec(trimmed);
  if (display) return display[1].trim();
  const inline = /^\$([\s\S]*)\$$/.exec(trimmed);
  if (inline) return inline[1].trim();
  return trimmed;
}
