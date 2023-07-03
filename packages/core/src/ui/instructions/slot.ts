import { View, viewToElement } from '../view';
import { effect } from '@uixjs/reactivity';

function slot(
  placeholder: HTMLElement,
  parentEls: Record<string, HTMLElement>,
  data: any,
  getSlotName: () => string,
  defaultView: View<any> | null
) {
  const defaultViewInstance = defaultView ? defaultView.instantiate(data, parentEls) : null;
  const defaultViewElement = defaultViewInstance ? viewToElement(defaultViewInstance) : document.createComment('');

  const commentPlaceholder = document.createComment('');

  let currentMounted = placeholder;
  currentMounted.replaceWith(commentPlaceholder, currentMounted);

  const effectCleanup = effect(() => {
    const slotElement = data.component.slots[getSlotName()] ?? defaultViewElement;

    if (commentPlaceholder.nextElementSibling === currentMounted) {
      currentMounted.replaceWith(slotElement);
    } else {
      commentPlaceholder.after(slotElement);
    }

    currentMounted = slotElement;
  }).cleanup;

  return () => {
    effectCleanup();
    if (defaultViewInstance) defaultViewInstance.cleanup();
  };
}

export { slot };
