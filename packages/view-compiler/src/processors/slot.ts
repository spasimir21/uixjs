import { getElementViewSelector } from '../elementViewId';
import { Node, HTMLElement } from '../node-html-parser';
import { viewFromElement } from '../viewFromElement';
import { ViewModuleData } from '../module';
import { ViewData } from '../view';

function processSlot(element: Node, view: ViewData, viewModule: ViewModuleData) {
  if (!(element instanceof HTMLElement) || element.tagName !== 'SLOT') return false;

  const defaultView = element.childNodes.length == 0 ? null : viewFromElement(element, viewModule);
  const elementViewSelector = getElementViewSelector(element);

  const defaultViewCode = defaultView ? `${defaultView.name}View` : 'null';

  const slotNameCode = element.getAttribute(':name') ?? `'${element.getAttribute('name')}'`;

  view.instructions.push(`u.slot(${elementViewSelector}, $, (${slotNameCode}), ${defaultViewCode})`);

  element.tagName = 'PLCH';
  element.removeAttribute(':name');
  element.removeAttribute('name');

  return true;
}

export { processSlot };
