import { ConstructorMap } from './utils/ConstructorMap';
import { raw } from './flags';

type EqualCheck<T> = (a: T, b: T, strict: boolean, circularProtection: Set<any>) => boolean;

const EqualCheckConstructorMap = new ConstructorMap<EqualCheck<any>>();

function areObjectsEqual(a: any, b: any, strict: boolean, circularProtection: Set<any>): b is typeof a {
  for (const key in a) if (!isEqual(a[key], b[key], strict, circularProtection)) return false;
  for (const key in b) if (!(key in a)) return false;
  return true;
}

function isEqual(a: any, b: any, strict: boolean = true, circularProtection: Set<any> = new Set()): b is typeof a {
  if (a === b) return true; // Quick exit

  a = raw(a);
  b = raw(b);

  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a == null || b == null || typeof a !== 'object') {
    if (typeof a === 'number' && isNaN(a) && isNaN(b)) return true;
    return strict ? a === b : a == b;
  }

  if (circularProtection.has(a) || circularProtection.has(b)) return false;

  circularProtection.add(a);
  circularProtection.add(b);

  if (a.constructor !== b.constructor) return false;

  let checkEquality = EqualCheckConstructorMap.get(a);
  if (checkEquality == null && a.constructor !== null && a.constructor !== Object) return false;
  checkEquality = checkEquality ?? areObjectsEqual;

  return checkEquality(a, b, strict, circularProtection);
}

EqualCheckConstructorMap.set(Object, areObjectsEqual);

EqualCheckConstructorMap.set(Array, (a: any[], b: any[], strict, circularProtection) => {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (!isEqual(a[i], b[i], strict, circularProtection)) return false;
  }

  return true;
});

export { EqualCheckConstructorMap, isEqual };
