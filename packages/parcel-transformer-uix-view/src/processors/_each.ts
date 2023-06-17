import { getElementViewSelector } from '../elementViewId';
import { Node, HTMLElement } from '../node-html-parser';
import { processElement } from './processElement';
import { ViewData, createView } from '../view';
import { ViewModuleData } from '../module';
import { markRemoved } from '../removed';
import { id } from '../id';

function viewFromElement(element: HTMLElement, viewModule: ViewModuleData) {
  const viewFragment = new HTMLElement(null as any, {}, '', null, [0, 0]);
  for (const node of element.childNodes) viewFragment.appendChild(node);

  const viewId = id();
  const view = createView(viewId, viewFragment);
  viewModule.views.unshift(view);

  processElement(viewFragment, view, viewModule);

  return view;
}

function processEach(element: Node, view: ViewData, viewModule: ViewModuleData) {
  if (!(element instanceof HTMLElement) || element.tagName !== 'EACH') return false;

  const sibling = element.nextElementSibling;
  const elseElement = sibling != null && sibling.tagName === 'ELSE' ? sibling : null;
  const elseView = elseElement ? viewFromElement(elseElement, viewModule) : null;

  const elementViewSelector = getElementViewSelector(element);
  const eachView = viewFromElement(element, viewModule);

  const elseViewCode = elseView ? `${elseView.name}View` : 'null';

  const codeParts = (element.getAttribute('_') ?? '').split(':');
  const eachCondition = codeParts.slice(1).join(':');
  const iteratorKey = codeParts[0].trim();

  // prettier-ignore
  view.instructions.push(
    `u._forEach(${elementViewSelector}, $, '${iteratorKey}', () => (${eachCondition}), ${eachView.name}View, ${elseViewCode})`
  );

  if (elseElement) {
    elseElement.remove();
    markRemoved(elseElement);
  }

  element.tagName = 'PLCH';
  element.removeAttribute('_');

  return true;
}

export { processEach };
