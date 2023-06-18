import { HTMLElement, Node, TextNode, NodeType } from '../node-html-parser';
import { getElementViewId } from '../elementViewId';
import { ViewData } from '../view';

const PAIRS = {
  '${': '}',
  '{': '}',
  "'": "'",
  '"': '"',
  '`': '`'
};

const BREAK_AT = new Set(['${']);

function matchAtPosition(string: string, search: string, position: number): boolean {
  for (let i = 0; i < search.length; i++) {
    if (string.charAt(position + i) !== search.charAt(i)) return false;
  }

  return true;
}

function matchPairs(string: string, pairs: Record<string, string>, breakAt: Set<string>) {
  const openPairs: string[] = [];
  const parts: string[] = [''];
  let position = 0;

  while (position < string.length) {
    if (string.charAt(position) === '\\') {
      parts[parts.length - 1] += '\\';
      position++;
      continue;
    }

    if (openPairs.length > 0) {
      const closingBracket = pairs[openPairs[openPairs.length - 1]];
      const matched = matchAtPosition(string, closingBracket, position);

      if (matched) {
        parts[parts.length - 1] += closingBracket;
        const openingBracket = openPairs.pop() as string;
        position += closingBracket.length;
        if (openPairs.length === 0 && breakAt.has(openingBracket)) parts.push('');
        continue;
      }
    }

    let didAddBracket = false;
    for (const bracket in pairs) {
      const matched = matchAtPosition(string, bracket, position);

      if (matched) {
        if (openPairs.length === 0 && breakAt.has(bracket)) parts.push('');
        parts[parts.length - 1] += bracket;
        openPairs.push(bracket);
        position += bracket.length;
        didAddBracket = true;
        break;
      }
    }

    if (didAddBracket) continue;

    parts[parts.length - 1] += string.charAt(position);
    position++;
  }

  return parts;
}

function processText(node: Node, view: ViewData) {
  if (node.nodeType !== NodeType.TEXT_NODE) return false;

  const parts = matchPairs(node.textContent, PAIRS, BREAK_AT);
  const nodes: Node[] = [];

  const fragment = new HTMLElement(null as any, {}, '', null, [0, 0]);

  for (const part of parts) {
    if (!part.startsWith('${')) {
      nodes.push(new TextNode(part, fragment));
      continue;
    }

    const placeholder = new HTMLElement('plch', {}, '', fragment, [0, 0]);
    const placeholderId = getElementViewId(placeholder);

    view.instructions.push(`u.textNode(e, '${placeholderId}', () => (${part.slice(2, -1)}))`);

    nodes.push(placeholder);
  }

  for (const node of nodes) fragment.appendChild(node);

  (node.parentNode as HTMLElement).exchangeChild(node, fragment);

  return true;
}

export { processText };
