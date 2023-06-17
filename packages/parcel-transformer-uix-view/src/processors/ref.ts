import { getElementViewSelector } from '../elementViewId';
import { Node, HTMLElement } from '../node-html-parser';
import { ViewData } from '../view';

function processRef(element: Node, view: ViewData) {
  if (!(element instanceof HTMLElement)) return false;
  if (!element.hasAttribute(':ref')) return false;

  const viewSelector = getElementViewSelector(element);

  view.instructions.push(`u.ref(${viewSelector}, e => (${element.getAttribute(':ref')} = e))`);

  element.removeAttribute(':ref');
  return false;
}

export { processRef };
