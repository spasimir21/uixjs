import { getElementViewSelector } from '../elementViewId';
import { Node, HTMLElement } from '../node-html-parser';
import { viewFromElement } from '../viewFromElement';
import { ViewModuleData } from '../module';
import { markRemoved } from '../removed';
import { ViewData } from '../view';

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

  const key = element.hasAttribute('key') ? element.getAttribute('key') : null;

  if (key) {
    // prettier-ignore
    view.instructions.push(
      `u._forEachKeyed(${elementViewSelector}, $, '${iteratorKey}', () => (${eachCondition}), ${iteratorKey} => (${key}), ${eachView.name}View, ${elseViewCode})`
    );
  } else {
    // prettier-ignore
    view.instructions.push(
      `u._forEach(${elementViewSelector}, $, '${iteratorKey}', () => (${eachCondition}), ${eachView.name}View, ${elseViewCode})`
    );
  }

  if (elseElement) {
    elseElement.remove();
    markRemoved(elseElement);
  }

  element.tagName = 'PLCH';
  element.removeAttribute('_');
  element.removeAttribute('key');

  return true;
}

export { processEach };
