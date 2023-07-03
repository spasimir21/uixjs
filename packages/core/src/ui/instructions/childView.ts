import { effect } from '@uixjs/reactivity';
import { View, ViewInstance, viewToElement } from '../view';
import { scope } from '../../scope';

function childView(
  placeholder: HTMLElement,
  elements: Record<string, HTMLElement>,
  data: any,
  getView: () => View<any>,
  childViewData: any
) {
  let viewInstance = null as ViewInstance<any> | null;
  let viewElement = null as ChildNode | null;

  let currentMounted = placeholder as ChildNode;
  currentMounted.replaceWith(document.createComment(''), currentMounted);

  const viewScope = scope(childViewData, data);

  const effectCleanup = effect(
    () => getView(),
    view => {
      if (viewInstance) viewInstance.cleanup();
      viewInstance = view.instantiate(viewScope, elements);
      viewElement = viewToElement(viewInstance);

      currentMounted.replaceWith(viewElement);
      currentMounted = viewElement;
    }
  ).cleanup;

  return () => {
    effectCleanup();
    if (viewInstance) viewInstance.cleanup();
  };
}

export { childView };
