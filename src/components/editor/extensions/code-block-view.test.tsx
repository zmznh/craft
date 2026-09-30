import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { NodeViewProps } from '@tiptap/react';
import { CodeBlockView } from './code-block-view';

function render(language: string | null) {
  const props = {
    node: { attrs: { language }, textContent: 'var a = 1' },
    updateAttributes: () => {},
  } as unknown as NodeViewProps;
  return renderToStaticMarkup(<CodeBlockView {...props} />);
}

describe('代码块语言下拉的展示值＝存储值，不替空值编造语言', () => {
  it('块上没有 language 时不出现任何选中项（官方＝无语言时不写 language 键）', () => {
    const html = render(null);
    expect(html).not.toMatch(/<option[^>]*\bselected\b/);
  });

  it('块上有 language 时选中项就是该语言', () => {
    const html = render('python');
    expect(html).toMatch(/<option value="python" selected/);
  });
});
