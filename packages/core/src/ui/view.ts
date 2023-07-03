import { Fragment } from './fragment/Fragment';
import { context } from '../context';
import { scope } from '../scope';

type ViewData<T> = T & { styleScopeId: string; view: View<T> };

type ViewInstructionsFunction<T> = (elements: Record<string, HTMLElement>, data: T) => ((() => void) | void)[];

interface ViewInstance<T> {
  view: View<T>;
  rootElement: HTMLDivElement;
  elements: Record<string, HTMLElement>;
  data: ViewData<T>;
  cleanup: () => void;
}

interface View<T> {
  styleScopeId: string | null;
  template: HTMLTemplateElement;
  instructionsFunction: ViewInstructionsFunction<T>;
  instantiate: (data: T, parentEls?: Record<string, HTMLElement>) => ViewInstance<T>;
}

function addStyleScopeIdToElement(element: HTMLElement, styleScopeId: string) {
  element.setAttribute(styleScopeId, '');

  for (const node of element.childNodes) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    addStyleScopeIdToElement(node as HTMLElement, styleScopeId);
  }
}

function view<T>(
  styleScopeId: string | null,
  templateSource: string,
  instructionsFunction: ViewInstructionsFunction<T>
): View<T> {
  const template = document.createElement('template');
  template.innerHTML = `<div>${templateSource}</div>`;

  const rootElement = template.content.firstElementChild as HTMLDivElement;
  for (const child of rootElement.childNodes) {
    if (child.nodeType === Node.COMMENT_NODE) {
      rootElement.removeChild(child);
      continue;
    }

    if (child.nodeType !== Node.TEXT_NODE) continue;
    if ((child.textContent as string).trim().length !== 0) continue;
    rootElement.removeChild(child);
  }

  if (styleScopeId != null) addStyleScopeIdToElement(rootElement, styleScopeId);

  const view: View<T> = {
    styleScopeId,
    template,
    instructionsFunction,
    instantiate: (data, parentEls) => instantiateView(view, data, parentEls)
  };

  return view;
}

function instantiateView<T>(view: View<T>, data: T, parentEls?: Record<string, HTMLElement>): ViewInstance<T> {
  const rootElement = view.template.content.cloneNode(true).firstChild as HTMLDivElement;

  const elementsAsArray = rootElement.querySelectorAll('[\\$]');
  let elements = {} as Record<string, HTMLElement>;
  for (const element of elementsAsArray) {
    elements[element.getAttribute('$') as string] = element as HTMLElement;
    element.removeAttribute('$');
  }

  elements = parentEls == null ? elements : context(elements, parentEls);

  const cleanupFunctions = view.instructionsFunction(elements, scope({ styleScopeId: view.styleScopeId, view }, data));
  const cleanup = () => {
    for (const cleanupFunction of cleanupFunctions) {
      if (cleanupFunction == null) continue;
      cleanupFunction();
    }
  };

  return {
    view,
    rootElement,
    elements,
    data: data as any,
    cleanup
  };
}

function viewToElement(view: ViewInstance<any>) {
  if (view.rootElement.childNodes.length === 1) return view.rootElement.childNodes[0];
  return new Fragment(Array.from(view.rootElement.childNodes));
}

export { View, ViewInstance, view, instantiateView, viewToElement };
