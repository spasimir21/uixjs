import { SubscribableNode } from './nodes/SubscribableNode';

class TrackStack {
  private static readonly stack: Set<SubscribableNode>[] = [];
  private static _isTracking: boolean = false;

  public static get isTracking(): boolean {
    return this._isTracking;
  }

  public static push() {
    this._isTracking = true;
    this.stack.push(new Set());
  }

  public static track(node: SubscribableNode) {
    if (!this._isTracking) return;
    this.stack[this.stack.length - 1].add(node);
  }

  public static pop() {
    if (this.stack.length <= 1) this._isTracking = false;
    return this.stack.pop() ?? null;
  }
}

export { TrackStack };
