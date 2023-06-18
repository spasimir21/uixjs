import { getElementViewSelector } from '../elementViewId';
import { Node, HTMLElement } from '../node-html-parser';
import { ViewData } from '../view';

function processInputs(element: Node, view: ViewData) {
  if (!(element instanceof HTMLElement)) return false;

  const attribsToBeProcessed = Object.keys(element.attributes).filter(attrib => attrib.startsWith(':'));
  if (attribsToBeProcessed.length === 0) return false;

  const viewSelector = getElementViewSelector(element);

  for (const attribName of attribsToBeProcessed) {
    const delayed = !attribName.endsWith('!');
    const inputName = attribName.slice(1, delayed ? undefined : -1);
    const code = element.getAttribute(attribName);

    view.instructions.push(
      `u.bindInput(${viewSelector}, '${inputName}', ${delayed}, () => (${code}), v => (${code} = v))`
    );

    element.removeAttribute(attribName);
  }

  return false;
}

export { processInputs };
