import { Node, HTMLElement } from '../node-html-parser';
import { StylesheetType } from '../stylesheet';
import { ViewModuleData } from '../module';
import { ViewData } from '../view';
import { id } from '../id';

function processStyle(element: Node, _view: ViewData, viewModule: ViewModuleData) {
  if (!(element instanceof HTMLElement) || (element.tagName !== 'LINK' && element.tagName !== 'STYLE')) return false;

  const styleScopeId = element.hasAttribute('scoped') ? viewModule.styleScopeId : null;

  if (element.tagName === 'LINK') {
    if (element.getAttribute('rel') !== 'stylesheet') return false;
    viewModule.stylesheets.push({
      id: id(),
      styleScopeId,
      type: StylesheetType.Link,
      href: element.getAttribute('href') as string
    });
  } else {
    viewModule.stylesheets.push({
      id: id(),
      styleScopeId,
      type: StylesheetType.Code,
      code: element.textContent
    });
  }

  element.remove();
  return true;
}

export { processStyle };
