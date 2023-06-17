import { effect } from '@uixjs/reactivity';

function textContent(element: HTMLElement, textGetter: () => string) {
  return effect(() => {
    element.textContent = textGetter();
  }).cleanup;
}

export { textContent };
