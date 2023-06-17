import { getElementViewSelector } from '../elementViewId';
import { Node, HTMLElement } from '../node-html-parser';
import { ViewData } from '../view';

function processModifiers(element: Node, view: ViewData) {
  if (!(element instanceof HTMLElement)) return false;

  const attribsToBeProcessed = Object.keys(element.attributes).filter(attrib => attrib.startsWith('*'));
  if (attribsToBeProcessed.length === 0) return false;

  const viewSelector = getElementViewSelector(element);

  for (const attribName of attribsToBeProcessed) {
    view.instructions.push(`${attribName.slice(1)}(${viewSelector}, $, ${element.getAttribute(attribName)})`);
    element.removeAttribute(attribName);
  }

  return false;
}

export { processModifiers };
