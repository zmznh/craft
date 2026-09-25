import { describe, expect, it } from 'vitest';
import { sanitizeMirrorHtml } from './mirror-html';

describe('sanitizeMirrorHtml', () => {
  it('keeps ordinary markup', () => {
    const html = '<p><strong>粗体</strong> <a href="/documents/a">链接</a></p>';
    expect(sanitizeMirrorHtml(html)).toBe(html);
  });

  it('removes script and iframe elements', () => {
    expect(sanitizeMirrorHtml('<p>前<script>alert(1)</script>后</p>')).toBe('<p>前后</p>');
    expect(sanitizeMirrorHtml('<p><iframe src="https://example.com"></iframe></p>')).toBe('<p></p>');
  });

  it('removes event handler attributes', () => {
    expect(sanitizeMirrorHtml('<p onclick="steal()">文字</p>')).toBe('<p>文字</p>');
  });

  it('neutralises script URLs but leaves inline images', () => {
    expect(sanitizeMirrorHtml('<a href="javascript:alert(1)">点</a>')).toBe('<a href="">点</a>');
    expect(sanitizeMirrorHtml('<img src="data:text/html,evil">')).toBe('<img src="">');
    expect(sanitizeMirrorHtml('<img src="data:image/png;base64,AAA">')).toBe('<img src="data:image/png;base64,AAA">');
  });
});
