import { effect } from '@uixjs/reactivity';

function styleProperty(element: HTMLElement, prop: keyof CSSStyleDeclaration, getter: () => string | undefined) {
  return effect(() => {
    (element.style as any)[prop] = getter();
  }).cleanup;
}

export { styleProperty };
