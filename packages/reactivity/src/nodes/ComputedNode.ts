import { SubscribableNode } from './SubscribableNode';
import { TrackStack } from '../TrackStack';
import { DuplexNode } from './DuplexNode';
import { reactive } from '../reactive';
import { $RAW, raw } from '../flags';
import { isEqual } from '../equal';

class ComputedNode<T> extends DuplexNode {
  private _value: T = null as T;

  get [$RAW]() {
    this.update();
    return raw(this._value);
  }

  get value() {
    this.update();
    this.track();
    return this._value;
  }

  constructor(private readonly getter: () => T) {
    super();
    this.isDirty = true; // This is so that we can update the value on the first get
  }

  public override invalidate(): void {
    super.invalidate();
    super.emitInvalidate();
  }

  public override markDirty(): void {
    super.markDirty();
    super.emitInvalidate();
  }

  public override validate(): void {
    super.validate();
    this.update();
  }

  private executeGetter() {
    TrackStack.push();
    const newValue = this.getter();
    this.updateSubscriptions(TrackStack.pop() as Set<SubscribableNode>);

    const oldValue = this._value;
    this._value = reactive(newValue);
    if (!isEqual(newValue, oldValue)) this.emitChange();
  }

  private update() {
    if (this.isInvalidated) this.validate();

    if (!this.isDirty) return;
    this.isDirty = false;

    this.executeGetter();
  }
}

function computed<T>(dependencies: () => void, getter: () => T): ComputedNode<T>;
function computed<T>(getter: () => T): ComputedNode<T>;
function computed<T>(getterOrDependencies: (() => void) | (() => T), getter?: () => T) {
  if (getter == null) return new ComputedNode(getterOrDependencies);

  return new ComputedNode(() => {
    getterOrDependencies();

    TrackStack.push();
    const result = getter();
    TrackStack.pop();

    return result;
  });
}

export { ComputedNode, computed };
