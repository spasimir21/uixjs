import { getElementViewSelector } from '../elementViewId';
import { Node, HTMLElement } from '../node-html-parser';
import { processElement } from './processElement';
import { ViewData, createView } from '../view';
import { ViewModuleData } from '../module';
import { markRemoved } from '../removed';
import { id } from '../id';

function processElementChain(elementChain: HTMLElement[], viewModule: ViewModuleData): [string | null, ViewData][] {
  const chain: [string | null, ViewData][] = [];

  for (const element of elementChain) {
    const viewFragment = new HTMLElement(null as any, {}, '', null, [0, 0]);
    for (const node of element.childNodes) viewFragment.appendChild(node);

    const viewId = id();
    const view = createView(viewId, viewFragment);
    viewModule.views.unshift(view);

    processElement(viewFragment, view, viewModule);

    const condition = element.getAttribute('_') ?? null;

    chain.push([condition, view]);
  }

  return chain;
}

function processIf(element: Node, view: ViewData, viewModule: ViewModuleData) {
  if (!(element instanceof HTMLElement) || element.tagName !== 'IF') return false;

  const elementChain: HTMLElement[] = [element];

  while (true) {
    const nextElement = elementChain[elementChain.length - 1].nextElementSibling;
    if (nextElement == null || (nextElement.tagName !== 'ELSE-IF' && nextElement.tagName !== 'ELSE')) break;
    elementChain.push(nextElement);
  }

  const viewsAndConditions = processElementChain(elementChain, viewModule);

  const lastViewAndCondition = viewsAndConditions[viewsAndConditions.length - 1];
  const elseView: ViewData | null = lastViewAndCondition[0] == null ? (viewsAndConditions.pop() as any)[1] : null;

  const elementViewSelector = getElementViewSelector(element);

  const elseViewCode = elseView ? `${elseView.name}View` : 'null';
  if (viewsAndConditions.length === 1) {
    const [condition, ifView] = viewsAndConditions[0];
    view.instructions.push(
      `u._if(${elementViewSelector}, $, () => (${condition}), ${ifView.name}View, ${elseViewCode})`
    );
  } else {
    const viewsAndConditionsCode = viewsAndConditions.map(
      ([condition, view]) => `[() => (${condition}), ${view.name}View]`
    );
    view.instructions.push(
      `u._condition(${elementViewSelector}, $, [${viewsAndConditionsCode.join(',')}], ${elseViewCode})`
    );
  }

  for (let i = 1; i < elementChain.length; i++) {
    elementChain[i].remove();
    markRemoved(elementChain[i]);
  }

  element.tagName = 'PLCH';
  element.removeAttribute('_');

  return true;
}

export { processIf };
