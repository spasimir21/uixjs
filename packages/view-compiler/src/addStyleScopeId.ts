import { HTMLElement } from './node-html-parser';

function addStyleScopeIdToElement(element: HTMLElement, styleScopeId: string) {
  element.setAttribute(styleScopeId, '');

  for (const node of element.childNodes) {
    if (!(node instanceof HTMLElement)) continue;
    addStyleScopeIdToElement(node, styleScopeId);
  }
}

export { addStyleScopeIdToElement };
