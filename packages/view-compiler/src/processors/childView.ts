import { getElementViewSelector } from '../elementViewId';
import { Node, HTMLElement } from '../node-html-parser';
import { ViewData } from '../view';

function processChildViews(element: Node, view: ViewData) {
  if (!(element instanceof HTMLElement) || element.tagName !== 'VIEW') return false;

  const elementViewSelector = getElementViewSelector(element);

  const viewGetterCode = `() => (${element.getAttribute('view')})`;
  const dataCode = `(${element.getAttribute('data') ?? '{}'})`;

  view.instructions.push(`u.childView(${elementViewSelector}, e, $, ${viewGetterCode}, ${dataCode})`);

  element.tagName = 'PLCH';
  element.removeAttribute('view');
  element.removeAttribute('data');

  return true;
}

export { processChildViews };
