import { View, ViewInstance, viewToElement } from '../view';
import { effect } from '@uixjs/reactivity';

function _condition<T>(
  placeholder: Element,
  parentEls: Record<string, HTMLElement>,
  data: T,
  views: [() => boolean, View<T>][],
  elseView: View<T> | null,
  keepalive: boolean = true
) {
  const viewInstances = new Array<ViewInstance<any> | null>(views.length).fill(null);
  const viewElements = new Array<ChildNode | null>(views.length).fill(null);

  let elseViewInstance = null as ViewInstance<any> | null;
  let elseViewElement = null as ChildNode | null;

  const commentPlaceholder = document.createComment('');

  let currentMounted: ChildNode = placeholder;
  currentMounted.replaceWith(document.createComment(''), commentPlaceholder);
  currentMounted = commentPlaceholder;

  const effectCleanup = effect(
    () => {
      for (let i = 0; i < views.length; i++) if (views[i][0]()) return i;
      return -1;
    },
    index => {
      if (!keepalive) {
        if (index !== -1 && elseViewInstance != null) {
          elseViewInstance.cleanup();
          elseViewInstance = null;
          elseViewElement = null;
        }

        for (let i = 0; i < views.length; i++) {
          if (viewInstances[i] == null || i === index) continue;
          viewInstances[i]?.cleanup();
          viewInstances[i] = null;
          viewElements[i] = null;
        }
      }

      let newMounted = commentPlaceholder as ChildNode;
      if (index === -1) {
        if (elseView != null && elseViewInstance == null) {
          elseViewInstance = elseView.instantiate(data, parentEls);
          elseViewElement = viewToElement(elseViewInstance);
        }

        if (elseViewElement) newMounted = elseViewElement;
      } else {
        if (viewInstances[index] == null) {
          viewInstances[index] = views[index][1].instantiate(data, parentEls);
          viewElements[index] = viewToElement(viewInstances[index] as ViewInstance<any>);
        }

        newMounted = viewElements[index] as ChildNode;
      }

      currentMounted.replaceWith(newMounted);
      currentMounted = newMounted;
    }
  ).cleanup;

  return () => {
    effectCleanup();
    if (elseViewInstance) elseViewInstance.cleanup();
    for (const viewInstance of viewInstances) if (viewInstance) viewInstance.cleanup();
  };
}

export { _condition };
