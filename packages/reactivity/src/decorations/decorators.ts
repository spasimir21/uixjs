import { DecorationType, addDecoration, applyDecoration } from './decorations';
import { TrackStack } from '../TrackStack';

function State(target: any, prop: string | number | symbol) {
  // if applied on static property
  if (typeof target === 'function') {
    applyDecoration(target, prop, { type: DecorationType.State, data: null });
    return;
  }

  addDecoration(target, prop, DecorationType.State);
}

function EffectDecorator(target: any, prop: string | number | symbol, dependencies?: (object: any) => any) {
  const callback =
    dependencies == null
      ? target[prop]
      : function (this: any) {
          const deps = dependencies(this);

          TrackStack.push();
          target[prop].call(this, deps);
          TrackStack.pop();
        };

  // if applied on static property
  if (typeof target === 'function') {
    applyDecoration(target, prop, { type: DecorationType.Effect, data: callback });
    return;
  }

  addDecoration(target, prop, DecorationType.Effect, callback);
}

function Effect<T>(dependencies: (target: T) => any): (target: any, prop: string | number | symbol) => void;
function Effect(target: any, prop: string | number | symbol): void;
function Effect(targetOrDependencies: any, prop?: string | number | symbol) {
  if (prop == null)
    return (target: any, prop: string | number | symbol) => EffectDecorator(target, prop, targetOrDependencies);

  EffectDecorator(targetOrDependencies, prop);
}

function ComputedDecorator(target: any, prop: string | number | symbol, dependencies?: (target: any) => any) {
  const descriptor = Object.getOwnPropertyDescriptor(target, prop);

  const originalGetter = (descriptor?.get ?? (() => null)) as any;
  const getter =
    dependencies == null
      ? originalGetter
      : function (this: any) {
          const deps = dependencies(this);

          TrackStack.push();
          const result = originalGetter.call(this, deps);
          TrackStack.pop();

          return result;
        };

  const data = {
    getter,
    descriptor,
    isStatic: false
  };

  // if applied on static property
  if (typeof target === 'function') {
    if (descriptor == null) return;

    data.isStatic = true;
    applyDecoration(target, prop, { type: DecorationType.Computed, data });

    return;
  }

  addDecoration(target, prop, DecorationType.Computed, data);
}

function Computed<T>(dependencies: (target: T) => any): (target: any, prop: string | number | symbol) => void;
function Computed(target: any, prop: string | number | symbol): void;
function Computed(targetOrDependencies: any, prop?: string | number | symbol) {
  if (prop == null)
    return (target: any, prop: string | number | symbol) => ComputedDecorator(target, prop, targetOrDependencies);

  ComputedDecorator(targetOrDependencies, prop);
}

function DependencyDecorator(target: any, prop: string | number | symbol, initializer?: (target: any) => any) {
  // if applied on static property
  if (typeof target === 'function') {
    applyDecoration(target, prop, { type: DecorationType.Dependency, data: initializer });
    return;
  }

  addDecoration(target, prop, DecorationType.Dependency, initializer);
}

function Dependency<T>(initializer: (target: T) => any): (target: any, prop: string | number | symbol) => void;
function Dependency(target: any, prop: string | number | symbol): void;
function Dependency(targetOrInitializer: any, prop?: string | number | symbol) {
  if (prop == null)
    return (target: any, prop: string | number | symbol) => DependencyDecorator(target, prop, targetOrInitializer);

  DependencyDecorator(targetOrInitializer, prop);
}

export { State, Effect, Computed, Dependency };
