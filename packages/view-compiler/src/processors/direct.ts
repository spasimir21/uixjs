import { getElementViewSelector } from '../elementViewId';
import { Node, HTMLElement } from '../node-html-parser';
import { ViewData } from '../view';

function processDirect(element: Node, view: ViewData) {
  if (!(element instanceof HTMLElement)) return false;

  const attribsToBeProcessed = Object.keys(element.attributes).filter(
    attrib => attrib.startsWith('d:') || attrib.startsWith('direct:')
  );

  if (attribsToBeProcessed.length === 0) return false;

  const viewSelector = getElementViewSelector(element);

  for (const attribName of attribsToBeProcessed) {
    const directName = attribName.split(':').slice(1).join(':');
    view.instructions.push(
      `u.bindDirect(${viewSelector}, '${directName}', () => (${element.getAttribute(attribName)}))`
    );
    element.removeAttribute(attribName);
  }

  return false;
}

export { processDirect };
