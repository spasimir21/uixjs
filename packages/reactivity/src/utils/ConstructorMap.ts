class ConstructorMap<T> {
  private readonly map: Map<any, T> = new Map();

  set(constructor: any, value: T) {
    this.map.set(constructor, value);
  }

  get(object: any): T | null {
    let constructor = object.constructor;

    while (constructor != null) {
      if (this.map.has(constructor)) return this.map.get(constructor) as T;
      constructor = constructor.__proto__;
    }

    return null;
  }
}

export { ConstructorMap };
