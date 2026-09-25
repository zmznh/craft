export interface PmNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: PmNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

const EMPTY_DOC: PmNode = { type: 'doc', content: [{ type: 'paragraph' }] };

/**
 * Converts Markdown (or the `text.md` of a Text Bundle) into the same node JSON
 * the editor stores. Deliberately dependency-free and scoped to what Craft has a
 * block for: headings, lists, tasks, quotes, code, rules, images and inline marks.
 */
export function parseMarkdown(source: string): PmNode {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const content = parseBlocks(lines);
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] };
}

function parseBlocks(lines: string[]): PmNode[] {
  const blocks: PmNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = /^```(.*)$/.exec(line);
    if (fence) {
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) {
        body.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push({
        type: 'codeBlock',
        attrs: { language: fence[1].trim() || null },
        content: body.length ? [{ type: 'text', text: body.join('\n') }] : undefined,
      });
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({
        type: 'heading',
        attrs: { level: heading[1].length },
        content: parseInline(heading[2]),
      });
      index += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push({ type: 'divider', attrs: { style: 'thin' } });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const body: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        body.push(lines[index].replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push({
        type: 'blockquote',
        content: parseBlocks(body),
      });
      continue;
    }

    const image = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/.exec(line.trim());
    if (image) {
      blocks.push({ type: 'imageBlock', attrs: { src: image[2], alt: image[1] || null } });
      index += 1;
      continue;
    }

    if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
      const collected: string[] = [];
      while (
        index < lines.length &&
        (/^\s*([-*+]|\d+[.)])\s+/.test(lines[index]) || (lines[index].trim() && /^\s{2,}/.test(lines[index])))
      ) {
        collected.push(lines[index]);
        index += 1;
      }
      blocks.push(parseList(collected));
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !/^\s*([-*+]|\d+[.)])\s+/.test(lines[index]) && !/^>|^```|^#{1,6}\s/.test(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: 'paragraph', content: parseInline(paragraph.join(' ')) });
  }

  return blocks;
}

interface ListItem {
  indent: number;
  text: string;
  checked: boolean | null;
  ordered: boolean;
}

function parseList(lines: string[]): PmNode {
  const items: ListItem[] = lines.map((line) => {
    const indent = line.length - line.trimStart().length;
    const marker = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(line);
    const raw = marker ? marker[3] : line.trim();
    const task = /^\[([ xX])\]\s+(.*)$/.exec(raw);
    return {
      indent,
      text: task ? task[2] : raw,
      checked: task ? task[1].toLowerCase() === 'x' : null,
      ordered: marker ? /\d/.test(marker[2]) : false,
    };
  });

  const ordered = items[0]?.ordered ?? false;
  const taskList = items.some((item) => item.checked !== null);
  const listType = taskList ? 'taskList' : ordered ? 'orderedList' : 'bulletList';

  const build = (start: number, indent: number): { nodes: PmNode[]; next: number } => {
    const nodes: PmNode[] = [];
    let cursor = start;

    while (cursor < items.length && items[cursor].indent >= indent) {
      if (items[cursor].indent > indent) {
        const nested = build(cursor, items[cursor].indent);
        const last = nodes[nodes.length - 1];
        if (last) last.content = [...(last.content ?? []), ...(nested.nodes[0] ? [nested.nodes[0]] : [])];
        cursor = nested.next;
        continue;
      }

      const item = items[cursor];
      cursor += 1;
      const deeper =
        cursor < items.length && items[cursor].indent > indent ? build(cursor, items[cursor].indent) : null;
      if (deeper) cursor = deeper.next;

      const paragraph: PmNode = { type: 'paragraph', content: parseInline(item.text) };
      const content = deeper ? [paragraph, ...deeper.nodes] : [paragraph];
      nodes.push({
        type: taskList ? 'taskItem' : 'listItem',
        attrs: taskList ? { checked: item.checked ?? false } : undefined,
        content,
      });
    }

    return { nodes: [{ type: listType, content: nodes }], next: cursor };
  };

  return build(0, items[0]?.indent ?? 0).nodes[0];
}

const INLINE =
  /(`[^`]+`)|(\*\*[\s\S]+?\*\*(?!\*))|(~~[\s\S]+?~~)|((?<!\*)\*(?!\s)[^*\n]+?\*(?!\*))|((?<!_)_(?!_)[^_\n]+?_(?!_))|(\[[^\]]*\]\([^)\s]+\))|(!\[[^\]]*\]\([^)\s]+\))/;

function parseInline(text: string): PmNode[] {
  const nodes: PmNode[] = [];
  let rest = text;

  while (rest.length) {
    const match = INLINE.exec(rest);
    if (!match) {
      pushText(nodes, rest);
      break;
    }
    const at = match.index;
    if (at > 0) pushText(nodes, rest.slice(0, at));

    const token = match[0];
    if (token.startsWith('`')) {
      pushMarked(nodes, token.slice(1, -1), { type: 'code' });
    } else if (token.startsWith('**')) {
      addMark(parseInline(token.slice(2, -2)), { type: 'bold' }, nodes);
    } else if (token.startsWith('~~')) {
      addMark(parseInline(token.slice(2, -2)), { type: 'strike' }, nodes);
    } else if (token.startsWith('[')) {
      const link = /^\[([^\]]*)\]\(([^)\s]+)\)$/.exec(token);
      addMark(parseInline(link?.[1] ?? ''), { type: 'link', attrs: { href: link?.[2] ?? '' } }, nodes);
    } else if (token.startsWith('![')) {
      const alt = /^!\[([^\]]*)\]/.exec(token)?.[1] ?? '';
      if (alt) pushText(nodes, alt);
    } else {
      addMark(parseInline(token.slice(1, -1)), { type: 'italic' }, nodes);
    }

    rest = rest.slice(at + token.length);
  }

  return nodes;
}

function pushText(nodes: PmNode[], text: string): void {
  if (text) nodes.push({ type: 'text', text });
}

function pushMarked(
  nodes: PmNode[],
  text: string,
  mark: { type: string; attrs?: Record<string, unknown> }
): void {
  if (text) nodes.push({ type: 'text', text, marks: [mark] });
}

function addMark(
  children: PmNode[],
  mark: { type: string; attrs?: Record<string, unknown> },
  out: PmNode[]
): void {
  for (const child of children) {
    if (child.type !== 'text') continue;
    out.push({ ...child, marks: [mark, ...(child.marks ?? [])] });
  }
}

export function titleFromMarkdown(source: string): string {
  const lines = source.split(/\r?\n/);
  for (const line of lines) {
    const heading = /^#{1,6}\s+(.*)$/.exec(line.trim());
    if (heading) return cleanTitle(heading[1]);
  }
  for (const line of lines) {
    if (line.trim()) return cleanTitle(line);
  }
  return '导入的笔记';
}

function cleanTitle(value: string): string {
  const plain = value
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .trim();
  return plain.slice(0, 80) || '导入的笔记';
}

/**
 * A Text Bundle is a folder; the readable part is its `text.md`, and the shallowest
 * one wins when several bundles are picked at once.
 */
export function pickTextBundleEntry(paths: string[]): string | null {
  const entries = paths.filter((path) => /(^|\/)[^/]+\.textbundle\/text\.md$/i.test(path));
  if (!entries.length) return null;
  return entries.sort(
    (a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b)
  )[0];
}
