const $IS_REACTIVE = Symbol('$IS_REACTIVE');
const $RAW = Symbol('$RAW');

function markReactive(object: any) {
  object[$IS_REACTIVE] = true;
}

function setRaw(object: any, rawValue: any) {
  object[$RAW] = rawValue;
}

function isReactive(object: any) {
  if (object == null || typeof object !== 'object') return false;
  return $IS_REACTIVE in object;
}

function raw(object: any) {
  if (!isReactive(object)) return object;
  return object[$RAW];
}

export { $IS_REACTIVE, $RAW, markReactive, setRaw, isReactive, raw };
