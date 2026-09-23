export interface ExtractedBlock {
  index: number;
  text: string;
  type: string;
}

function nodeText(node: any): string {
  if (!node) return '';
  if (node.type === 'text') return node.text ?? '';
  if (Array.isArray(node.content)) {
    return node.content.map(nodeText).join('');
  }
  return '';
}

export function pmNodeText(node: any): string {
  return nodeText(node).replace(/\s+/g, ' ').trim();
}

export function extractBlocks(content: unknown): ExtractedBlock[] {
  const blocks: ExtractedBlock[] = [];
  if (!content || typeof content !== 'object') return blocks;

  const doc = content as { content?: any[] };
  const children = Array.isArray(doc.content) ? doc.content : [];

  children.forEach((node, index) => {
    const text = nodeText(node).replace(/\s+/g, ' ').trim();
    if (text) {
      blocks.push({ index, text, type: node.type ?? 'paragraph' });
    }
  });

  return blocks;
}
