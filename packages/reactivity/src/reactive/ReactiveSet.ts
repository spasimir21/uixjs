import { SubscribableNode } from '../nodes/SubscribableNode';
import { Reactive } from '../decorations/Reactive';
import { TrackStack } from '../TrackStack';

@Reactive
class ReactiveSet<T> extends Set<T> {
  private readonly nodes = new Map<T, SubscribableNode>();
  private readonly $valuesNode = new SubscribableNode();
  private readonly $sizeNode = new SubscribableNode();

  constructor(private readonly set: Set<T>) {
    super();
  }

  override get size() {
    this.$sizeNode.track();
    return this.set.size;
  }

  override add(value: T): this {
    if (this.set.has(value)) return this;

    this.set.add(value);

    const node = this.nodes.get(value);
    if (node != null) node.emitChange();
    this.$valuesNode.emitChange();
    this.$sizeNode.emitChange();

    return this;
  }

  override has(value: T): boolean {
    if (TrackStack.isTracking) {
      let node = this.nodes.get(value);

      if (node == null) {
        node = new SubscribableNode();
        this.nodes.set(value, node);
      }

      node.track();
    }

    return this.set.has(value);
  }

  override delete(value: T): boolean {
    if (!this.set.has(value)) return false;

    this.set.delete(value);

    const node = this.nodes.get(value);
    if (node != null) node.emitChange();
    this.$valuesNode.emitChange();
    this.$sizeNode.emitChange();

    return true;
  }

  override clear(): void {
    for (const value of this.set) this.delete(value);
  }

  override values(): IterableIterator<T> {
    this.$valuesNode.track();
    return this.set.values();
  }

  override entries(): IterableIterator<[T, T]> {
    this.$valuesNode.track();
    return this.set.entries();
  }

  override keys(): IterableIterator<T> {
    this.$valuesNode.track();
    return this.set.keys();
  }

  // TODO: Test reactivity
  override forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
    this.set.forEach(callbackfn, thisArg);
  }

  override [Symbol.iterator](): IterableIterator<T> {
    this.$valuesNode.track();
    return this.set[Symbol.iterator]();
  }
}

export { ReactiveSet };
