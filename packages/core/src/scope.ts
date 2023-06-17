function scope(object: any, prevScope: any) {
  return new Proxy(object, {
    get(_, prop) {
      if (Reflect.has(object, prop)) return Reflect.get(object, prop);
      return Reflect.get(prevScope, prop);
    },
    set(_, prop, newValue) {
      if (!Reflect.has(object, prop) && Reflect.has(prevScope, prop)) return Reflect.set(prevScope, prop, newValue);
      return Reflect.set(object, prop, newValue);
    },
    has(_, prop) {
      return Reflect.has(object, prop) || Reflect.has(prevScope, prop);
    },
    ownKeys(_) {
      return Array.from(new Set([...Reflect.ownKeys(object), ...Reflect.ownKeys(prevScope)]));
    },
    deleteProperty(_, prop) {
      return Reflect.deleteProperty(object, prop);
    }
  });
}

export { scope };
