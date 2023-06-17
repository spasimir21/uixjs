import { SubscribableNode } from './SubscribableNode';
import { applyMixins } from '../utils/applyMixins';
import { SubscriberNode } from './SubscriberNode';
import { ReactiveNode } from './ReactiveNode';

interface DuplexNode extends SubscriberNode, SubscribableNode {}

class DuplexNode extends ReactiveNode {
  // We have to define the properties because mixins don't initialize them
  protected readonly subscriptions: Set<SubscribableNode> = new Set();
  protected readonly subscribers: Set<SubscriberNode> = new Set();
  protected isInvalidated: boolean = false;
  protected isDirty: boolean = false;
}

applyMixins(DuplexNode, [SubscriberNode, SubscribableNode]);

export { DuplexNode };
