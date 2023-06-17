import { Node, HTMLElement } from '../node-html-parser';

function processComponentTag(element: Node) {
  if (!(element instanceof HTMLElement) || element.tagName !== 'COMPONENT') return false;
  element.remove();
  return true;
}

export { processComponentTag };
