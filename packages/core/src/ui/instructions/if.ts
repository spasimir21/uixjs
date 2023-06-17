import { View, viewToElement } from '../view';
import { effect } from '@uixjs/reactivity';

function _if<T>(placeholder: Element, data: T, condition: () => boolean, view: View<T>, elseView: View<T> | null) {
  const elseViewInstance = elseView ? elseView.instantiate(data) : null;
  const viewInstance = view.instantiate(data);

  const elseViewElement = elseViewInstance ? viewToElement(elseViewInstance) : document.createComment('');
  const viewElement = viewToElement(viewInstance);

  let currentMounted: ChildNode = placeholder;
  currentMounted.replaceWith(document.createComment(''), currentMounted);

  const effectCleanup = effect(() => {
    const newMounted = condition() ? viewElement : elseViewElement;
    currentMounted.replaceWith(newMounted);
    currentMounted = newMounted;
  }).cleanup;

  return () => {
    effectCleanup();
    viewInstance.cleanup();
    if (elseViewInstance) elseViewInstance.cleanup();
  };
}

export { _if };
