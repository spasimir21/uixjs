import { getElementViewId, getElementViewSelector } from '../elementViewId';
import { isCustomComponent } from '../isCustomComponent';
import { Node, HTMLElement } from '../node-html-parser';
import { ViewModuleData } from '../module';
import { ViewData } from '../view';

const $IS_COMPONENT = Symbol('$IS_COMPONENT');

function processComponent(element: Node, view: ViewData, viewModule: ViewModuleData) {
  if (!(element instanceof HTMLElement) || element.tagName == null) return false;

  if (!isCustomComponent(element)) {
    element.removeAttribute('$nc');
    return false;
  }

  const viewId = getElementViewId(element);

  const tagNameParts = element.tagName.toLowerCase().split(':');
  const registryName = tagNameParts.length === 1 ? null : tagNameParts.shift();
  const componentName = tagNameParts.join(':');

  // prettier-ignore
  view.instructions.push(
    `u.component(e, '${viewId}', $, '${componentName}'${registryName ? `, '${registryName}'` : ''})`
  );

  element.tagName = 'PLCH';
  (element as any)[$IS_COMPONENT] = true;

  return false;
}

function processComponentInit(element: Node, view: ViewData) {
  if (!(element instanceof HTMLElement) || (element as any)[$IS_COMPONENT] !== true) return false;

  const viewSelector = getElementViewSelector(element);
  view.instructions.push(`u.initComponent(${viewSelector})`);

  return false;
}

export { processComponent, processComponentInit };
