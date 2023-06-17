import { effect } from '@uixjs/reactivity';

function bindInput<T>(
  element: HTMLInputElement,
  key: string,
  delayed: boolean,
  getter: () => T,
  setter: (value: T) => void
) {
  element.addEventListener(delayed ? 'change' : 'input', () => setter((element as any)[key]));

  return effect(() => {
    (element as any)[key] = getter();
  }).cleanup;
}

export { bindInput };
