import { SubscribableNode } from './SubscribableNode';
import { ReactiveNode } from './ReactiveNode';

class SubscriberNode extends ReactiveNode {
  protected readonly subscriptions: Set<SubscribableNode> = new Set();
  protected isInvalidated: boolean = false;
  protected isDirty: boolean = false;

  constructor() {
    super();
    this.cleanup = this.cleanup.bind(this);
  }

  public updateSubscriptions(newSubscriptions: Set<SubscribableNode>, copy: boolean = true) {
    if (copy) newSubscriptions = new Set(newSubscriptions);

    for (const subscription of this.subscriptions) {
      if (!newSubscriptions.has(subscription)) {
        subscription.unsubscribe(this);
        this.subscriptions.delete(subscription);
      }

      newSubscriptions.delete(subscription);
    }

    for (const subscription of newSubscriptions) {
      subscription.subscribe(this);
      this.subscriptions.add(subscription);
    }
  }

  public override validate() {
    for (const subscription of this.subscriptions) subscription.validate();
    this.isInvalidated = false;
  }

  public markDirty(): void {
    this.isDirty = true;
  }

  public invalidate(): void {
    this.isInvalidated = true;
  }

  public cleanup() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe(this);
      this.subscriptions.delete(subscription);
    }
  }
}

export { SubscriberNode };
