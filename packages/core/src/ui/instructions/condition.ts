import { View, viewToElement } from '../view';
import { effect } from '@uixjs/reactivity';

function _condition<T>(placeholder: Element, data: T, views: [() => boolean, View<T>][], elseView: View<T> | null) {
  const elseViewInstance = elseView ? elseView.instantiate(data) : null;
  const viewInstances = views.map(v => v[1].instantiate(data));

  const elseViewElement = elseViewInstance ? viewToElement(elseViewInstance) : document.createComment('');
  const viewElements = viewInstances.map(viewToElement);

  let currentMounted: ChildNode = placeholder;
  currentMounted.replaceWith(document.createComment(''), currentMounted);

  const effectCleanup = effect(() => {
    let newMounted = elseViewElement;

    for (let i = 0; i < views.length; i++) {
      if (!views[i][0]()) continue;
      newMounted = viewElements[i];
      break;
    }

    currentMounted.replaceWith(newMounted);
    currentMounted = newMounted;
  }).cleanup;

  return () => {
    effectCleanup();
    for (const view of viewInstances) view.cleanup();
    if (elseViewInstance) elseViewInstance.cleanup();
  };
}

export { _condition };
