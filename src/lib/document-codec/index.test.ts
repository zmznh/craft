import { describe, expect, it } from 'vitest';
import { serializeDocument } from './index';

const document = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '标题' }] },
    { type: 'paragraph', content: [{ type: 'text', text: '正文' }] },
    { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '完成任务' }] }] }] },
  ],
};

describe('serializeDocument', () => {
  it('serializes core nodes to markdown', () => {
    expect(serializeDocument(document, 'markdown')).toBe('# 标题\n\n正文\n\n- [x] 完成任务');
  });

  it('serializes core nodes to plain text', () => {
    expect(serializeDocument(document, 'text')).toBe('标题\n正文\n完成任务');
  });

  it('serializes core nodes to html', () => {
    expect(serializeDocument(document, 'html')).toContain('<h1>标题</h1>');
    expect(serializeDocument(document, 'html')).toContain('<input type="checkbox" checked disabled>');
  });
});
