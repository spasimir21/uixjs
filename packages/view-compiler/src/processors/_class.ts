import { getElementViewSelector } from '../elementViewId';
import { Node, HTMLElement } from '../node-html-parser';
import { ViewData } from '../view';

function processClasses(element: Node, view: ViewData) {
  if (!(element instanceof HTMLElement)) return false;

  const attribsToBeProcessed = Object.keys(element.attributes).filter(attrib => attrib.startsWith('.'));
  if (attribsToBeProcessed.length === 0) return false;

  const viewSelector = getElementViewSelector(element);

  for (const attribName of attribsToBeProcessed) {
    view.instructions.push(
      `u._class(${viewSelector}, '${attribName.slice(1)}', () => (${element.getAttribute(attribName)}))`
    );
    element.removeAttribute(attribName);
  }

  return false;
}

export { processClasses };
