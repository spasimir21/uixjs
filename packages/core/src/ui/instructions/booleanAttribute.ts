import { effect } from '@uixjs/reactivity';

function booleanAttribute(element: HTMLElement, attribute: string, predicate: () => boolean) {
  return effect(() => {
    if (predicate()) {
      element.setAttribute(attribute, '');
    } else {
      element.removeAttribute(attribute);
    }
  }).cleanup;
}

export { booleanAttribute };
