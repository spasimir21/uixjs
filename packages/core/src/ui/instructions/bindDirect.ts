import { effect } from '@uixjs/reactivity';

function bindDirect<T>(element: HTMLElement, key: string, getter: () => T) {
  return effect(() => {
    (element as any)[key] = getter();
  }).cleanup;
}

export { bindDirect };
