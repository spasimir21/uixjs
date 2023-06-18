import { HTMLElement } from './node-html-parser';
import { id } from './id';

function getElementViewSelector(element: HTMLElement): string {
  if (element.tagName === 'COMPONENT') return '$.component';
  return `e['${getElementViewId(element)}']`;
}

function getElementViewId(element: HTMLElement) {
  if (element.hasAttribute('$')) return element.getAttribute('$') as string;
  const viewId = id();
  element.setAttribute('$', viewId);
  return viewId;
}

export { getElementViewSelector, getElementViewId };
