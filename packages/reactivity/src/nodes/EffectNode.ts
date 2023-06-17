import { SubscribableNode } from './SubscribableNode';
import { SubscriberNode } from './SubscriberNode';
import { TrackStack } from '../TrackStack';

class EffectNode extends SubscriberNode {
  private isScheduled: boolean = false;

  constructor(private readonly callback: () => void, autorun: boolean = true) {
    super();
    this.update = this.update.bind(this);
    this.execute = this.execute.bind(this);
    if (autorun) this.execute();
  }

  public override markDirty(): void {
    super.markDirty();
    this.schedule();
  }

  public override invalidate(): void {
    super.invalidate();
    this.schedule();
  }

  public execute(): void {
    TrackStack.push();
    this.callback();
    this.updateSubscriptions(TrackStack.pop() as Set<SubscribableNode>);
  }

  private update() {
    if (this.isInvalidated) this.validate();
    this.isScheduled = false;

    if (!this.isDirty) return;
    this.isDirty = false;

    this.execute();
  }

  private schedule() {
    if (this.isScheduled) return;
    this.isScheduled = true;

    setTimeout(this.update, 0);
  }
}

function effect(dependencies: () => void, callback: () => void, autorun?: boolean): EffectNode;
function effect(callback: () => void, autorun?: boolean): EffectNode;
function effect(callbackOrDependencies: () => void, callbackOrAutorun?: boolean | (() => void), autorun?: boolean) {
  if (callbackOrAutorun == null || typeof callbackOrAutorun == 'boolean')
    return new EffectNode(callbackOrDependencies, callbackOrAutorun);

  return new EffectNode(() => {
    callbackOrDependencies();

    TrackStack.push();
    callbackOrAutorun();
    TrackStack.pop();
  }, autorun);
}

export { EffectNode, effect };
