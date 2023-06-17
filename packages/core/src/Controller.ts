import {
  DecorationType,
  applyDecoration,
  applyDecorations,
  cleanupDecorations,
  cleanupDependencies,
  markReactive,
  setRaw
} from '@uixjs/reactivity';
import { UixComponent } from './ui/component/Component';

class Controller<TProps = any, TExports = any, TShared = any, TAttributes extends string = any> {
  isMounted: boolean = false;

  constructor(
    public readonly component: UixComponent,
    public readonly attributes: Record<TAttributes, string>,
    public readonly props: TProps,
    public readonly _exports: TExports,
    public readonly shared: TShared,
    public readonly context: any
  ) {
    this.cleanup = this.cleanup.bind(this);

    markReactive(this);
    setRaw(this, this);

    applyDecoration(this, 'isMounted', {
      type: DecorationType.State,
      data: null
    });
  }

  $init() {
    this.init();
    applyDecorations(this);
  }

  protected init() {}

  $onFirstMount() {
    this.isMounted = true;
    this.onFirstMount();
  }

  protected onFirstMount() {}

  $onMount() {
    this.isMounted = true;
    this.onMount();
  }

  protected onMount() {}

  $onUnmount() {
    this.isMounted = false;
    this.onUnmount();
  }

  protected onUnmount() {}

  $emit(eventName: string, data: any, options: EventInit = {}) {
    this.component.dispatchEvent(new CustomEvent(eventName, { ...options, detail: data }));
  }

  protected onKill() {}

  cleanup() {
    this.onKill();
    cleanupDecorations(this);
    cleanupDependencies(this);
  }
}

export { Controller };
