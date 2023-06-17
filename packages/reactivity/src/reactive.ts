import { $IS_REACTIVE, $RAW, isReactive, markReactive, setRaw } from './flags';
import { SubscribableNode } from './nodes/SubscribableNode';
import { ConstructorMap } from './utils/ConstructorMap';
import { ReactiveSet } from './reactive/ReactiveSet';
import { TrackStack } from './TrackStack';
import { isEqual } from './equal';

type MakeReactiveFunction<T, U extends T> = (object: T) => U;

const MakeReactiveConstructorMap = new ConstructorMap<MakeReactiveFunction<any, any>>();

function makeObjectReactive(object: any): any {
  const nodes = {
    key: {} as Record<string | symbol, SubscribableNode>,
    has: {} as Record<string | symbol, SubscribableNode>,
    $keys: new SubscribableNode()
  };

  for (const prop of Object.getOwnPropertyNames(object)) {
    const desc = Object.getOwnPropertyDescriptor(object, prop);
    if (desc?.get != null || desc?.set != null || !desc?.writable) continue;
    object[prop] = reactive(object[prop]);
  }

  const proxy = new Proxy(object, {
    get(target, prop) {
      if (prop === $IS_REACTIVE) return true;
      if (prop === $RAW) return target;

      if (TrackStack.isTracking) {
        const tempProp = '$' + prop.toString();
        if (nodes.key[tempProp] == null) nodes.key[tempProp] = new SubscribableNode();
        nodes.key[tempProp].track();
      }

      return Reflect.get(target, prop);
    },
    set(target, prop, newValue) {
      if (prop === $RAW || prop === $IS_REACTIVE) return true;

      const oldValue = Reflect.get(target, prop);
      const hasProp = prop in target;

      const didSet = Reflect.set(target, prop, reactive(newValue));

      if (!didSet || isEqual(oldValue, newValue)) return didSet;

      const tempProp = '$' + prop.toString();
      if (!hasProp) {
        if (nodes.has[tempProp] != null) nodes.has[tempProp].emitChange();
        nodes.$keys.emitChange();
      }

      if (nodes.key[tempProp] != null) nodes.key[tempProp].emitChange();

      return didSet;
    },
    has(target, prop) {
      if (prop === $RAW || prop === $IS_REACTIVE) return true;

      const tempProp = '$' + prop.toString();
      if (TrackStack.isTracking) {
        if (nodes.has[tempProp] == null) nodes.has[tempProp] = new SubscribableNode();
        nodes.has[tempProp].track();
      }

      return Reflect.has(target, prop);
    },
    ownKeys(target) {
      nodes.$keys.track();
      return Reflect.ownKeys(target);
    },
    deleteProperty(target, prop) {
      if (prop === $RAW || prop === $IS_REACTIVE) return false;

      const hasProp = prop in target;
      const didDelete = Reflect.deleteProperty(target, prop);

      if (!hasProp || !didDelete) return didDelete;

      const tempProp = '$' + prop.toString();
      if (nodes.key[tempProp] != null) nodes.key[tempProp].emitChange();
      if (nodes.has[tempProp] != null) nodes.has[tempProp].emitChange();
      nodes.$keys.emitChange();

      return didDelete;
    }
  });

  return proxy;
}

function reactive<T>(object: T): T {
  if (object == null || typeof object !== 'object' || isReactive(object)) return object;

  let makeReactive = MakeReactiveConstructorMap.get(object);
  if (makeReactive == null && object.constructor !== null && object.constructor !== Object) return object;
  makeReactive = makeReactive ?? makeObjectReactive;

  const reactiveObject = makeReactive(object);

  markReactive(reactiveObject);
  setRaw(reactiveObject, object);

  return reactiveObject;
}

// TODO: Add better support for Array, Map
MakeReactiveConstructorMap.set(Array, makeObjectReactive);
MakeReactiveConstructorMap.set(Set, set => new ReactiveSet(set));

export { MakeReactiveConstructorMap, reactive };
