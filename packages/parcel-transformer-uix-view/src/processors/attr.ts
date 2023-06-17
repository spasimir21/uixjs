import { getElementViewSelector } from '../elementViewId';
import { Node, HTMLElement } from '../node-html-parser';
import { ViewData } from '../view';

function processAttributes(element: Node, view: ViewData) {
  if (!(element instanceof HTMLElement)) return false;

  const attribsToBeProcessed = Object.keys(element.attributes).filter(
    attrib => attrib.startsWith('a:') || attrib.startsWith('attr:')
  );

  if (attribsToBeProcessed.length === 0) return false;

  const viewSelector = getElementViewSelector(element);

  for (const attribName of attribsToBeProcessed) {
    const attrName = attribName.split(':').slice(1).join(':');
    view.instructions.push(`u.attribute(${viewSelector}, '${attrName}', () => (${element.getAttribute(attribName)}))`);
    element.removeAttribute(attribName);
  }

  return false;
}

export { processAttributes };
