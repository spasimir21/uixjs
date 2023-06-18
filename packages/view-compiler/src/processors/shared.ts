import { getElementViewSelector } from '../elementViewId';
import { Node, HTMLElement } from '../node-html-parser';
import { ViewData } from '../view';

function processShared(element: Node, view: ViewData) {
  if (!(element instanceof HTMLElement)) return false;

  const attribsToBeProcessed = Object.keys(element.attributes).filter(
    attrib => attrib.startsWith('s:') || attrib.startsWith('shared:')
  );

  if (attribsToBeProcessed.length === 0) return false;

  const viewSelector = getElementViewSelector(element);

  for (const attribName of attribsToBeProcessed) {
    const sharedName = attribName.split(':').slice(1).join(':');
    const code = element.getAttribute(attribName);
    // prettier-ignore
    view.instructions.push(
      `u.shared(${viewSelector}, '${sharedName}', () => (${code}), v => (${code} = v))`
    );
    element.removeAttribute(attribName);
  }

  return false;
}

export { processShared };
