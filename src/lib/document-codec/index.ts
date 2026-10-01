export type ExportFormat = 'markdown' | 'html' | 'text' | 'json';

function textContent(node: any): string {
  if (!node) return '';
  if (node.type === 'text') return node.text ?? '';
  const inner = Array.isArray(node.content) ? node.content.map(textContent).join('') : '';
  // Atom nodes keep their label in an attribute, so an attachment or a whiteboard
  // link still says something in the plain-text export.
  return inner || node.attrs?.title || node.attrs?.name || '';
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

function blockTargetHref(node: any): string {
  const base = `/documents/${node.attrs?.documentId ?? ''}`;
  if (node.attrs?.blockId) return `${base}#b-${node.attrs.blockId}`;
  if (typeof node.attrs?.blockIndex === 'number') return `${base}#i-${node.attrs.blockIndex}`;
  return base;
}

function mirrorTargetHref(node: any): string {
  return blockTargetHref({
    attrs: {
      documentId: node.attrs?.sourceDocumentId,
      blockId: node.attrs?.sourceBlockId,
      blockIndex: node.attrs?.sourceBlockIndex,
    },
  });
}

// A person mention carries a userId and no documentId, so there is no document to
// link to — exporting it as a link would fabricate `/documents/` with an empty id.
function isPersonMention(node: any): boolean {
  return node.type === 'mention' && !node.attrs?.documentId;
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
  if (node.type === 'inlineMath') return `$${node.attrs?.latex ?? ''}$`;
  if (node.type === 'mention' || node.type === 'blockLink') {
    if (isPersonMention(node)) return `@${node.attrs?.title ?? ''}`;
    return `[${node.attrs?.title ?? '链接'}](${blockTargetHref(node)})`;
  }
  if (node.type === 'whiteboardLink') {
    return `[白板：${node.attrs?.title ?? ''}](/whiteboards/${node.attrs?.whiteboardId ?? ''})`;
  }
  return Array.isArray(node.content) ? node.content.map(renderInlineMarkdown).join('') : '';
}

const LIST_NODE_TYPES = ['bulletList', 'orderedList', 'taskList'];

/** Craft's flavour indents one level with three spaces (`indentationCharacters`). */
function renderList(node: any, depth: number): string {
  const pad = '   '.repeat(depth);
  return (node.content ?? []).map((item: any, index: number) => {
    const marker = node.type === 'taskList'
      ? `- [${item.attrs?.checked ? 'X' : ' '}] `
      : node.type === 'orderedList'
        ? `${index + 1}. `
        : '- ';
    const children = item.content ?? [];
    const own = children.filter((child: any) => !LIST_NODE_TYPES.includes(child.type)).map(textContent).join(' ');
    const nested = children.filter((child: any) => LIST_NODE_TYPES.includes(child.type));
    return [`${pad}${marker}${own}`, ...nested.map((child: any) => renderList(child, depth + 1))].join('\n');
  }).join('\n');
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
    case 'orderedList':
    case 'taskList':
      return renderList(node, 0);
    case 'blockquote':
      return (node.content ?? []).map(renderMarkdown).join('\n').split('\n').map((line: string) => `> ${line}`).join('\n');
    case 'codeBlock':
      return `\`\`\`${node.attrs?.language ?? ''}\n${textContent(node)}\n\`\`\``;
    case 'horizontalRule':
    case 'divider':
      return '---';
    case 'mathBlock':
      return `$$\n${node.attrs?.latex ?? ''}\n$$`;
    case 'columns':
      // Markdown has no columns; the content survives as sequential blocks.
      return (node.content ?? [])
        .map((column: any) => (column.content ?? []).map(renderMarkdown).filter(Boolean).join('\n\n'))
        .filter(Boolean)
        .join('\n\n');
    case 'callout':
      return (node.content ?? [])
        .map(renderMarkdown)
        .filter(Boolean)
        .join('\n')
        .split('\n')
        .map((line: string) => `> ${line}`)
        .join('\n');
    case 'cardBlock':
    case 'toggleBlock':
      return (node.content ?? []).map(renderMarkdown).filter(Boolean).join('\n\n');
    case 'table':
      return renderMarkdownTable(node);
    case 'imageGallery':
      return (node.attrs?.images ?? [])
        .map((image: { url?: string; src?: string; alt?: string }) =>
          `![${image.alt ?? ''}](${image.url ?? image.src ?? ''})`)
        .join('\n\n');
    case 'attachment':
      return `[📎 ${node.attrs?.name ?? '附件'}](${node.attrs?.url ?? ''})`;
    case 'linkPreview':
      return `[${node.attrs?.title || node.attrs?.url || '链接'}](${node.attrs?.url ?? ''})`;
    case 'videoEmbed':
      return `[视频](${node.attrs?.src ?? ''})`;
    case 'whiteboardLink':
    case 'whiteboardEmbed':
      return `[白板：${node.attrs?.title || '未命名'}](/whiteboards/${node.attrs?.whiteboardId ?? ''})`;
    case 'mirrorBlock':
      // A mirror is a pointer, so the export keeps the source address.
      return `> 镜像：[${node.attrs?.title || '未命名'}](${mirrorTargetHref(node)})`;
    case 'drawing':
      return '_(手绘板)_';
    default:
      return textContent(node);
  }
}

function renderMarkdownTable(node: any): string {
  // Backslashes must be doubled before pipes are escaped, otherwise a trailing
  // backslash swallows the delimiter that follows it.
  const rows = (node.content ?? []).map((row: any) =>
    (row.content ?? []).map((cell: any) =>
      textContent(cell).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim()));
  if (rows.length === 0) return '';

  const [head, ...body] = rows;
  const divider = head.map(() => '---');
  return [head, divider, ...body]
    .map((cells) => `| ${cells.join(' | ')} |`)
    .join('\n');
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
    case 'columns': return `<div data-type="columns">${(node.content ?? []).map((column: any) => renderHtml(column)).join('')}</div>`;
    case 'column': return `<div data-type="column">${(node.content ?? []).map(renderHtml).join('')}</div>`;
    case 'image':
    case 'imageBlock': return `<img src="${escapeHtml(node.attrs?.src ?? node.attrs?.url ?? '')}" alt="${escapeHtml(node.attrs?.alt ?? '')}">`;
    case 'mathBlock': return `<div data-type="math-block" data-latex="${escapeHtml(node.attrs?.latex ?? '')}">$$${escapeHtml(node.attrs?.latex ?? '')}$$</div>`;
    case 'inlineMath': return `<span data-type="inline-math" data-latex="${escapeHtml(node.attrs?.latex ?? '')}">$${escapeHtml(node.attrs?.latex ?? '')}$</span>`;
    case 'callout': return `<blockquote data-type="callout" data-style="${escapeHtml(node.attrs?.type ?? 'info')}">${(node.content ?? []).map(renderHtml).join('')}</blockquote>`;
    case 'cardBlock': return `<div data-type="cardBlock">${(node.content ?? []).map(renderHtml).join('')}</div>`;
    case 'toggleBlock': {
      const children = node.content ?? [];
      const [first, ...rest] = children;
      return `<details${node.attrs?.open ? ' open' : ''}><summary>${escapeHtml(textContent(first))}</summary>${rest.map(renderHtml).join('')}</details>`;
    }
    case 'table': return `<table>${(node.content ?? []).map((row: any, index: number) => `<tr>${(row.content ?? []).map((cell: any) => `<${index === 0 ? 'th' : 'td'}>${(cell.content ?? []).map(renderHtml).join('')}</${index === 0 ? 'th' : 'td'}>`).join('')}</tr>`).join('')}</table>`;
    case 'imageGallery': return `<div data-type="imageGallery">${(node.attrs?.images ?? []).map((image: { url?: string; src?: string; alt?: string }) => `<img src="${escapeHtml(image.url ?? image.src ?? '')}" alt="${escapeHtml(image.alt ?? '')}">`).join('')}</div>`;
    case 'attachment': return `<a href="${escapeHtml(node.attrs?.url ?? '')}" data-type="attachment">📎 ${escapeHtml(node.attrs?.name ?? '附件')}</a>`;
    case 'linkPreview': return `<a href="${escapeHtml(node.attrs?.url ?? '')}" data-type="linkPreview">${escapeHtml(node.attrs?.title || node.attrs?.url || '')}</a>`;
    case 'videoEmbed': return `<iframe src="${escapeHtml(node.attrs?.src ?? '')}" data-type="videoEmbed" allowFullScreen></iframe>`;
    case 'whiteboardLink': return `<a href="/whiteboards/${escapeHtml(node.attrs?.whiteboardId ?? '')}" data-type="whiteboardLink">🎨 ${escapeHtml(node.attrs?.title ?? '白板')}</a>`;
    case 'whiteboardEmbed': return `<div data-type="whiteboard-embed" data-whiteboard-id="${escapeHtml(node.attrs?.whiteboardId ?? '')}" data-title="${escapeHtml(node.attrs?.title ?? '白板')}">🎨 ${escapeHtml(node.attrs?.title ?? '白板')}</div>`;
    case 'mirrorBlock': return `<div data-type="mirrorBlock"><a href="${escapeHtml(mirrorTargetHref(node))}">镜像：${escapeHtml(node.attrs?.title ?? '未命名')}</a></div>`;
    case 'mention':
    case 'blockLink': return isPersonMention(node)
      ? `<span data-type="mention">@${escapeHtml(node.attrs?.title ?? '')}</span>`
      : `<a href="${escapeHtml(blockTargetHref(node))}" data-type="${node.type}">${escapeHtml(node.attrs?.title ?? '链接')}</a>`;
    case 'drawing': return `<div data-type="drawing">_(手绘板)_</div>`;
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
