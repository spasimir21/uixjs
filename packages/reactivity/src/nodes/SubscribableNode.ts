import { SubscriberNode } from './SubscriberNode';
import { ReactiveNode } from './ReactiveNode';
import { TrackStack } from '../TrackStack';

class SubscribableNode extends ReactiveNode {
  protected readonly subscribers: Set<SubscriberNode> = new Set();

  public track() {
    TrackStack.track(this);
  }

  public subscribe(subscriber: SubscriberNode) {
    this.subscribers.add(subscriber);
  }

  public unsubscribe(subscriber: SubscriberNode) {
    this.subscribers.delete(subscriber);
  }

  public emitInvalidate() {
    for (const subscriber of this.subscribers) subscriber.invalidate();
  }

  public emitChange() {
    for (const subscriber of this.subscribers) subscriber.markDirty();
  }
}

export { SubscribableNode };
