export type ExportFormat = 'markdown' | 'html' | 'text' | 'json';

function textContent(node: any): string {
  if (!node) return '';
  if (node.type === 'text') return node.text ?? '';
  return Array.isArray(node.content) ? node.content.map(textContent).join('') : '';
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

function renderInlineMarkdown(node: any): string {
  if (!node) return '';
  if (node.type === 'text') {
    let value = node.text ?? '';
    for (const mark of node.marks ?? []) {
      if (mark.type === 'bold') value = `**${value}**`;
      if (mark.type === 'italic') value = `*${value}*`;
      if (mark.type === 'code') value = `\`${value}\``;
      if (mark.type === 'link') value = `[${value}](${mark.attrs?.href ?? ''})`;
    }
    return value;
  }
  return Array.isArray(node.content) ? node.content.map(renderInlineMarkdown).join('') : '';
}

function renderMarkdown(node: any): string {
  if (!node) return '';
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map(renderMarkdown).filter(Boolean).join('\n\n');
    case 'paragraph':
      return (node.content ?? []).map(renderInlineMarkdown).join('');
    case 'heading':
      return `${'#'.repeat(node.attrs?.level ?? 1)} ${(node.content ?? []).map(renderInlineMarkdown).join('')}`;
    case 'bulletList':
      return (node.content ?? []).map((item: any) => `- ${textContent(item)}`).join('\n');
    case 'orderedList':
      return (node.content ?? []).map((item: any, index: number) => `${index + 1}. ${textContent(item)}`).join('\n');
    case 'taskList':
      return (node.content ?? []).map((item: any) => `- [${item.attrs?.checked ? 'x' : ' '}] ${textContent(item)}`).join('\n');
    case 'blockquote':
      return (node.content ?? []).map(renderMarkdown).join('\n').split('\n').map((line: string) => `> ${line}`).join('\n');
    case 'codeBlock':
      return `\`\`\`${node.attrs?.language ?? ''}\n${textContent(node)}\n\`\`\``;
    case 'horizontalRule':
    case 'divider':
      return '---';
    default:
      return textContent(node);
  }
}

function renderHtmlInline(node: any): string {
  if (!node) return '';
  if (node.type === 'text') {
    let value = escapeHtml(node.text ?? '');
    for (const mark of node.marks ?? []) {
      if (mark.type === 'bold') value = `<strong>${value}</strong>`;
      if (mark.type === 'italic') value = `<em>${value}</em>`;
      if (mark.type === 'code') value = `<code>${value}</code>`;
      if (mark.type === 'link') value = `<a href="${escapeHtml(mark.attrs?.href ?? '')}">${value}</a>`;
    }
    return value;
  }
  return renderHtml(node);
}

function renderHtml(node: any): string {
  if (!node) return '';
  const content = (node.content ?? []).map(renderHtmlInline).join('');
  switch (node.type) {
    case 'doc': return (node.content ?? []).map(renderHtml).join('');
    case 'paragraph': return `<p>${content}</p>`;
    case 'heading': return `<h${node.attrs?.level ?? 1}>${content}</h${node.attrs?.level ?? 1}>`;
    case 'bulletList': return `<ul>${(node.content ?? []).map((item: any) => `<li>${escapeHtml(textContent(item))}</li>`).join('')}</ul>`;
    case 'orderedList': return `<ol>${(node.content ?? []).map((item: any) => `<li>${escapeHtml(textContent(item))}</li>`).join('')}</ol>`;
    case 'taskList': return `<ul data-type="taskList">${(node.content ?? []).map((item: any) => `<li data-type="taskItem"><input type="checkbox"${item.attrs?.checked ? ' checked' : ''} disabled>${escapeHtml(textContent(item))}</li>`).join('')}</ul>`;
    case 'blockquote': return `<blockquote>${content}</blockquote>`;
    case 'codeBlock': return `<pre><code>${escapeHtml(textContent(node))}</code></pre>`;
    case 'horizontalRule':
    case 'divider': return '<hr>';
    case 'image':
    case 'imageBlock': return `<img src="${escapeHtml(node.attrs?.src ?? node.attrs?.url ?? '')}" alt="${escapeHtml(node.attrs?.alt ?? '')}">`;
    default: return content || escapeHtml(textContent(node));
  }
}

const blockTypes = new Set([
  'doc', 'paragraph', 'heading', 'bulletList', 'orderedList', 'taskList',
  'taskItem', 'listItem', 'blockquote', 'codeBlock', 'horizontalRule', 'divider',
]);

function renderText(node: any): string[] {
  if (!node) return [];
  if (blockTypes.has(node.type)) {
    const inner = (node.content ?? [])
      .flatMap((child: any) => renderText(child))
      .filter(Boolean);
    return node.type === 'doc' ? inner : [inner.join('')];
  }
  const text = textContent(node);
  return text ? [text] : [];
}

export function serializeDocument(document: unknown, format: ExportFormat): string {
  if (format === 'json') return JSON.stringify(document, null, 2);
  if (format === 'markdown') return renderMarkdown(document).trim();
  if (format === 'html') return renderHtml(document).trim();
  return renderText(document).join('\n').trim();
}
