import { Node, HTMLElement } from '../node-html-parser';

function processIgnored(element: Node) {
  if (!(element instanceof HTMLElement)) return false;
  if (!element.hasAttribute('$i')) return false;

  element.removeAttribute('$i');

  return true;
}

export { processIgnored };
