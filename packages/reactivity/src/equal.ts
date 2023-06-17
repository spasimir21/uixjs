import { ConstructorMap } from './utils/ConstructorMap';
import { raw } from './flags';

type EqualCheck<T> = (a: T, b: T, strict: boolean) => boolean;

const EqualCheckConstructorMap = new ConstructorMap<EqualCheck<any>>();

function areObjectsEqual(a: any, b: any, strict: boolean): b is typeof a {
  for (const key in a) if (!isEqual(a[key], b[key], strict)) return false;
  for (const key in b) if (!(key in a)) return false;
  return true;
}

function isEqual(a: any, b: any, strict: boolean = true): b is typeof a {
  if (a === b) return true; // Quick exit

  a = raw(a);
  b = raw(b);

  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a == null || b == null || typeof a !== 'object') {
    if (typeof a === 'number' && isNaN(a) && isNaN(b)) return true;
    return strict ? a === b : a == b;
  }

  if (a.constructor !== b.constructor) return false;

  const checkEquality = EqualCheckConstructorMap.get(a) ?? areObjectsEqual;
  return checkEquality(a, b, strict);
}

EqualCheckConstructorMap.set(Object, areObjectsEqual);

EqualCheckConstructorMap.set(Array, (a: any[], b: any[], strict: boolean) => {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (!isEqual(a[i], b[i], strict)) return false;
  }

  return true;
});

export { EqualCheckConstructorMap, isEqual };
