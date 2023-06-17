function applyMixins(targetConstructor: any, mixins: any[]) {
  for (const mixin of mixins) {
    for (const prop of Object.getOwnPropertyNames(mixin.prototype)) {
      Object.defineProperty(
        targetConstructor.prototype,
        prop,
        Object.getOwnPropertyDescriptor(mixin.prototype, prop) ?? Object.create(null)
      );
    }

    for (const prop of Object.getOwnPropertySymbols(mixin.prototype)) {
      Object.defineProperty(
        targetConstructor.prototype,
        prop,
        Object.getOwnPropertyDescriptor(mixin.prototype, prop) ?? Object.create(null)
      );
    }
  }
}

export { applyMixins };
