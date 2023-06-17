import { SubscribableNode } from './SubscribableNode';
import { reactive } from '../reactive';
import { $RAW, raw } from '../flags';
import { isEqual } from '../equal';

class StateNode<T> extends SubscribableNode {
  private _value: T;

  get [$RAW]() {
    return raw(this._value);
  }

  get value() {
    this.track();
    return this._value;
  }

  set value(newValue: T) {
    const oldValue = this._value;
    this._value = reactive(newValue);
    if (!isEqual(newValue, oldValue)) this.emitChange();
  }

  constructor(value: T) {
    super();
    this._value = reactive(value);
  }
}

function state<T>(value: T) {
  return new StateNode<T>(value);
}

export { StateNode, state };
