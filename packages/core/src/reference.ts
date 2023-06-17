function objectReference<T extends object>(initialObject: T) {
  let object = initialObject;

  const setObject = (newObject: T) => (object = newObject);

  const proxy = new Proxy<T>({} as any, {
    apply(_, thisArg, argArray) {
      return Reflect.apply(object as any, thisArg, argArray);
    },
    construct(_, argArray, newTarget) {
      return Reflect.construct(object as any, argArray, newTarget);
    },
    defineProperty(_, property, attributes) {
      return Reflect.defineProperty(object, property, attributes);
    },
    deleteProperty(_, prop) {
      return Reflect.deleteProperty(object, prop);
    },
    get(_, prop, receiver) {
      return Reflect.get(object, prop, receiver);
    },
    getOwnPropertyDescriptor(_, prop) {
      return Reflect.getOwnPropertyDescriptor(object, prop);
    },
    getPrototypeOf(_) {
      return Reflect.getPrototypeOf(object);
    },
    has(_, prop) {
      return Reflect.has(object, prop);
    },
    isExtensible(_) {
      return Reflect.isExtensible(object);
    },
    ownKeys(_) {
      return Reflect.ownKeys(object);
    },
    preventExtensions(_) {
      return Reflect.preventExtensions(object);
    },
    set(_, prop, newValue, receiver) {
      return Reflect.set(object, prop, newValue, receiver);
    },
    setPrototypeOf(_, value) {
      return Reflect.setPrototypeOf(object, value);
    }
  });

  return {
    object: proxy,
    set: setObject
  };
}

export { objectReference };
