import { UixComponent } from '../component/Component';
import { effect } from '@uixjs/reactivity';

function prop<T>(uixComponent: UixComponent, prop: string, getter: () => T) {
  return effect(() => {
    uixComponent.props[prop] = getter();
  }).cleanup;
}

export { prop };
