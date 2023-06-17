import { getElementViewSelector } from '../elementViewId';
import { Node, HTMLElement } from '../node-html-parser';
import { ViewData } from '../view';

function processExports(element: Node, view: ViewData) {
  if (!(element instanceof HTMLElement)) return false;

  const attribsToBeProcessed = Object.keys(element.attributes).filter(
    attrib => attrib.startsWith('e:') || attrib.startsWith('export:')
  );

  if (attribsToBeProcessed.length === 0) return false;

  const viewSelector = getElementViewSelector(element);

  for (const attribName of attribsToBeProcessed) {
    const exportName = attribName.split(':').slice(1).join(':');
    view.instructions.push(
      `u._export(${viewSelector}, '${exportName}', v => (${element.getAttribute(attribName)} = v))`
    );
    element.removeAttribute(attribName);
  }

  return false;
}

export { processExports };
