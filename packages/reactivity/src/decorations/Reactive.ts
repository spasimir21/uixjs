import { applyDecorations, cleanupDecorations } from './decorations';
import { cleanupDependencies } from '../dependencies';
import { markReactive, setRaw } from '../flags';

function Reactive<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      this.cleanup = this.cleanup.bind(this);

      markReactive(this);
      setRaw(this, this);

      applyDecorations(this);
    }

    cleanup() {
      // @ts-ignore
      if (super.cleanup != null) super.cleanup();
      cleanupDecorations(this);
      cleanupDependencies(this);
    }
  };
}

export { Reactive };
