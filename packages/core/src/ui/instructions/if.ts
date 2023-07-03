import { View, ViewInstance, viewToElement } from '../view';
import { effect } from '@uixjs/reactivity';

function _if<T>(
  placeholder: Element,
  parentEls: Record<string, HTMLElement>,
  data: T,
  condition: () => boolean,
  view: View<T>,
  elseView: View<T> | null,
  keepalive: boolean = true
) {
  let viewInstance = null as ViewInstance<any> | null;
  let viewElement = null as ChildNode | null;

  let elseViewInstance = null as ViewInstance<any> | null;
  let elseViewElement = null as ChildNode | null;

  const commentPlaceholder = document.createComment('');

  let currentMounted: ChildNode = placeholder;
  currentMounted.replaceWith(document.createComment(''), commentPlaceholder);
  currentMounted = commentPlaceholder;

  const effectCleanup = effect(condition, isTrue => {
    let newMounted = commentPlaceholder as ChildNode;

    if (isTrue) {
      if (!keepalive && elseViewInstance != null) {
        elseViewInstance.cleanup();
        elseViewInstance = null;
        elseViewElement = null;
      }

      if (viewInstance == null) {
        viewInstance = view.instantiate(data, parentEls);
        viewElement = viewToElement(viewInstance);
      }

      newMounted = viewElement as ChildNode;
    } else {
      if (!keepalive && viewInstance != null) {
        viewInstance.cleanup();
        viewInstance = null;
        viewElement = null;
      }

      if (elseView != null && elseViewInstance == null) {
        elseViewInstance = elseView.instantiate(data, parentEls);
        elseViewElement = viewToElement(elseViewInstance);
      }

      if (elseViewElement) newMounted = elseViewElement;
    }

    currentMounted.replaceWith(newMounted);
    currentMounted = newMounted;
  }).cleanup;

  return () => {
    effectCleanup();
    if (viewInstance) viewInstance.cleanup();
    if (elseViewInstance) elseViewInstance.cleanup();
  };
}

export { _if };
