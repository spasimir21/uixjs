import { View, viewToElement } from '../view';
import { effect } from '@uixjs/reactivity';

function slot(placeholder: HTMLElement, data: any, slotName: string, defaultView: View<any> | null) {
  const defaultViewInstance = defaultView ? defaultView.instantiate(data) : null;
  const defaultViewElement = defaultViewInstance ? viewToElement(defaultViewInstance) : document.createComment('');

  let currentMounted = placeholder;
  currentMounted.replaceWith(document.createComment(''), currentMounted);

  const effectCleanup = effect(() => {
    const slotElement = data.component.slots[slotName] ?? defaultViewElement;
    currentMounted.replaceWith(slotElement);
    currentMounted = slotElement;
  }).cleanup;

  return () => {
    effectCleanup();
    if (defaultViewInstance) defaultViewInstance.cleanup();
  };
}

export { slot };
