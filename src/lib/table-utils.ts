'use client';

import type { Editor } from '@tiptap/react';
import type { Node as PMNode } from '@tiptap/pm/model';

function findTable(
  editor: Editor
): { node: PMNode; pos: number } | null {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth >= 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === 'table') {
      return { node, pos: $from.before(depth) };
    }
  }
  return null;
}

function rowSortKey(row: PMNode): string {
  const firstCell = row.content.content[0];
  return firstCell ? firstCell.textContent : '';
}

export function sortTable(editor: Editor, dir: 'asc' | 'desc'): boolean {
  const found = findTable(editor);
  if (!found) return false;
  const { node: table, pos } = found;

  const rows = table.content.content.filter(
    (n: PMNode) => n.type.name === 'tableRow'
  );
  const headerRows = rows.filter(
    (r: PMNode) => r.content.content[0]?.type.name === 'tableHeader'
  );
  const bodyRows = rows.filter(
    (r: PMNode) => r.content.content[0]?.type.name !== 'tableHeader'
  );

  const sorted = [...bodyRows].sort((a: PMNode, b: PMNode) => {
    const ka = rowSortKey(a);
    const kb = rowSortKey(b);
    const na = parseFloat(ka.replace(/[^\d.-]/g, ''));
    const nb = parseFloat(kb.replace(/[^\d.-]/g, ''));
    if (!Number.isNaN(na) && !Number.isNaN(nb)) {
      return dir === 'asc' ? na - nb : nb - na;
    }
    const cmp = ka.localeCompare(kb, 'zh-CN');
    return dir === 'asc' ? cmp : -cmp;
  });

  const newContent = [...headerRows, ...sorted];
  const newTable = table.type.create(
    table.attrs,
    newContent.map((r: PMNode) => r.toJSON())
  );

  editor.view.dispatch(
    editor.state.tr
      .replaceWith(pos, pos + table.nodeSize, newTable)
      .scrollIntoView()
  );
  return true;
}

const FORMULA_RE = /^=(SUM|AVG|MIN|MAX|COUNT)\(([A-Za-z]+\d+(?::[A-Za-z]+\d+)?)\)$/i;

interface CellRef {
  node: PMNode;
  pos: number;
  row: number;
  col: number;
}

function labelToIndex(label: string): { row: number; col: number } | null {
  const m = label.match(/^([A-Za-z]+)(\d+)$/);
  if (!m) return null;
  let col = 0;
  for (const ch of m[1].toUpperCase()) {
    col = col * 26 + (ch.charCodeAt(0) - 64);
  }
  return { row: parseInt(m[2], 10), col };
}

function regionLabels(ref: string): string[] {
  const parts = ref.split(':');
  if (parts.length === 1) return [parts[0].trim()];
  const from = labelToIndex(parts[0].trim());
  const to = labelToIndex(parts[1].trim());
  if (!from || !to) return [];
  const labels: string[] = [];
  for (let r = Math.min(from.row, to.row); r <= Math.max(from.row, to.row); r++) {
    for (let c = Math.min(from.col, to.col); c <= Math.max(from.col, to.col); c++) {
      let colStr = '';
      let n = c;
      while (n > 0) {
        colStr = String.fromCharCode(((n - 1) % 26) + 65) + colStr;
        n = Math.floor((n - 1) / 26);
      }
      labels.push(`${colStr}${r}`);
    }
  }
  return labels;
}

function extractNumbers(text: string): number[] {
  const matches = text.match(/-?\d+(?:\.\d+)?/g) ?? [];
  return matches.map((m) => parseFloat(m));
}

export function evalFormulas(editor: Editor): boolean {
  const state = editor.state;
  const replacements: { pos: number; cellType: string; text: string }[] = [];

  state.doc.descendants((table, tablePos) => {
    if (table.type.name !== 'table') return true;

    // 1-based grid (A1 = row 1, col A), positions are absolute in the doc
    const cells = new Map<string, CellRef>();
    let rowPos = tablePos + 1;
    let rowIndex = 0;
    table.content.content.forEach((row: PMNode) => {
      rowIndex++;
      let colPos = rowPos + 1;
      let colIndex = 0;
      row.content.content.forEach((cell: PMNode) => {
        colIndex++;
        if (
          (cell.type.name === 'tableCell' || cell.type.name === 'tableHeader') &&
          cell.textContent.trim() !== ''
        ) {
          let colStr = '';
          let n = colIndex;
          while (n > 0) {
            colStr = String.fromCharCode(((n - 1) % 26) + 65) + colStr;
            n = Math.floor((n - 1) / 26);
          }
          cells.set(`${colStr}${rowIndex}`, {
            node: cell,
            pos: colPos,
            row: rowIndex,
            col: colIndex,
          });
        }
        colPos += cell.nodeSize;
      });
      rowPos += row.nodeSize;
    });

    for (const ref of cells.values()) {
      const m = ref.node.textContent.trim().match(FORMULA_RE);
      if (!m) continue;
      const func = m[1].toLowerCase();
      const numbers: number[] = [];
      for (const label of regionLabels(m[2])) {
        const target = cells.get(label.toUpperCase());
        if (!target) continue;
        numbers.push(...extractNumbers(target.node.textContent));
      }

      let result: number;
      switch (func) {
        case 'sum':
          result = numbers.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          result = numbers.length
            ? numbers.reduce((a, b) => a + b, 0) / numbers.length
            : 0;
          break;
        case 'min':
          result = numbers.length ? Math.min(...numbers) : 0;
          break;
        case 'max':
          result = numbers.length ? Math.max(...numbers) : 0;
          break;
        default:
          result = numbers.length;
      }
      replacements.push({
        pos: ref.pos,
        cellType: ref.node.type.name,
        text: Number.isInteger(result) ? String(result) : result.toFixed(2),
      });
    }
    return true;
  });

  if (replacements.length === 0) return false;

  // Replace from the end so earlier positions stay valid
  replacements.sort((a, b) => b.pos - a.pos);
  let tr = state.tr;
  for (const rep of replacements) {
    const paragraph = state.schema.nodes.paragraph.create(
      null,
      state.schema.text(rep.text)
    );
    const cellNode = state.schema.nodes[rep.cellType].create(
      null,
      paragraph
    );
    tr = tr.replaceWith(rep.pos, rep.pos + state.doc.nodeAt(rep.pos)!.nodeSize, cellNode);
  }
  editor.view.dispatch(tr.scrollIntoView());
  return true;
}
