import { Node, HTMLElement } from '../node-html-parser';
import { ViewModuleData } from '../module';
import { ViewData } from '../view';

function processInsert(element: Node, _view: ViewData, viewModule: ViewModuleData) {
  if (!(element instanceof HTMLElement) || element.tagName !== 'INSERT') return false;
  viewModule.inserts.push(element.textContent);
  element.remove();
  return true;
}

export { processInsert };
