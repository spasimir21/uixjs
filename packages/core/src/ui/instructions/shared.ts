import { UixComponent } from '../component/Component';
import { effect } from '@uixjs/reactivity';

function shared<T>(uixComponent: UixComponent, key: string, getter: () => T, setter: (value: T) => void) {
  const effectACleanup = effect(() => {
    uixComponent.shared[key] = getter();
  }).cleanup;

  const effectBCleanup = effect(() => setter(uixComponent.shared[key])).cleanup;

  return () => {
    effectACleanup();
    effectBCleanup();
  };
}

export { shared };
