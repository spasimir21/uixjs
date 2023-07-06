enum ControllerDecorationType {
  Prop,
  Shared,
  Export,
  Inject
}

type ControllerDecoration = { type: ControllerDecorationType; data: any };

type ControllerDecorations = Record<string | number | symbol, ControllerDecoration>;

const CONTROLLER_DECORATION_APPLICATION_ORDER = [
  ControllerDecorationType.Prop,
  ControllerDecorationType.Shared,
  ControllerDecorationType.Export,
  ControllerDecorationType.Inject
];

const $APPLIED_CONTROLLER_DECORATIONS = Symbol('$APPLIED_CONTROLLER_DECORATIONS');
const $CONTROLLER_DECORATIONS = Symbol('$CONTROLLER_DECORATIONS');

function addControllerDecoration(
  target: any,
  prop: string | number | symbol,
  type: ControllerDecorationType,
  data?: any
) {
  if (target[$CONTROLLER_DECORATIONS] == null) target[$CONTROLLER_DECORATIONS] = {};
  target[$CONTROLLER_DECORATIONS][prop] = { type, data };
}

function applyPropDecoration(target: any, prop: string | number | symbol, propName?: string) {
  propName = propName ?? (prop as any);

  Object.defineProperty(target, prop, {
    get() {
      return this.props[propName as any];
    },
    configurable: false,
    enumerable: true
  });
}

function applySharedDecoration(target: any, prop: string | number | symbol, sharedName?: string) {
  sharedName = sharedName ?? (prop as any);

  Object.defineProperty(target, prop, {
    get() {
      return this.shared[sharedName as any];
    },
    set(value: any) {
      this.shared[sharedName as any] = value;
    },
    configurable: false,
    enumerable: true
  });
}

function applyExportDecoration(target: any, prop: string | number | symbol, exportName?: string) {
  exportName = exportName ?? (prop as any);

  target._exports[exportName as any] = target[prop];
  Object.defineProperty(target, prop, {
    get() {
      return this._exports[exportName as any];
    },
    set(value: any) {
      this._exports[exportName as any] = value;
    },
    configurable: false,
    enumerable: true
  });
}

function applyInjectDecoration(target: any, prop: string | number | symbol, getter: (context: any) => any) {
  target[prop] = getter(target.context);
}

function applyControllerDecoration(target: any, prop: string | number | symbol, decoration: ControllerDecoration) {
  if (target[$APPLIED_CONTROLLER_DECORATIONS] == null) target[$APPLIED_CONTROLLER_DECORATIONS] = new Set();
  if (target[$APPLIED_CONTROLLER_DECORATIONS].has(prop)) return;
  target[$APPLIED_CONTROLLER_DECORATIONS].add(prop);

  // prettier-ignore
  const applicationFunction =
      decoration.type === ControllerDecorationType.Prop ? applyPropDecoration
    : decoration.type === ControllerDecorationType.Shared ? applySharedDecoration
    : decoration.type === ControllerDecorationType.Export ? applyExportDecoration
    : applyInjectDecoration;

  // @ts-ignore
  applicationFunction(target, prop, decoration.data);
}

function applyControllerDecorations(
  target: any,
  types: ControllerDecorationType[] = CONTROLLER_DECORATION_APPLICATION_ORDER,
  decorations?: ControllerDecorations
) {
  if (decorations == null) decorations = (target[$CONTROLLER_DECORATIONS] ?? {}) as ControllerDecorations;

  for (const decorationType of types) {
    for (const prop in decorations) {
      const decoration = decorations[prop];
      if (decoration.type !== decorationType) continue;
      applyControllerDecoration(target, prop, decoration);
    }
  }
}

function Decorator(target: any, prop: string | number | symbol, type: ControllerDecorationType, data?: any) {
  // if applied on static property
  if (typeof target === 'function') {
    applyControllerDecoration(target, prop, { type, data });
    return;
  }

  addControllerDecoration(target, prop, type, data);
}

function Prop(propName: string): (target: any, prop: string | number | symbol) => void;
function Prop(target: any, prop: string | number | symbol): void;
function Prop(targetOrPropName: any, prop?: string | number | symbol) {
  if (prop == null)
    return (target: any, prop: string | number | symbol) =>
      Decorator(target, prop, ControllerDecorationType.Prop, targetOrPropName);

  Decorator(targetOrPropName, prop, ControllerDecorationType.Prop);
}

function Shared(sharedName: string): (target: any, prop: string | number | symbol) => void;
function Shared(target: any, prop: string | number | symbol): void;
function Shared(targetOrSharedName: any, prop?: string | number | symbol) {
  if (prop == null)
    return (target: any, prop: string | number | symbol) =>
      Decorator(target, prop, ControllerDecorationType.Shared, targetOrSharedName);

  Decorator(targetOrSharedName, prop, ControllerDecorationType.Shared);
}

function Export(exportName: string): (target: any, prop: string | number | symbol) => void;
function Export(target: any, prop: string | number | symbol): void;
function Export(targetOrExportName: any, prop?: string | number | symbol) {
  if (prop == null)
    return (target: any, prop: string | number | symbol) =>
      Decorator(target, prop, ControllerDecorationType.Export, targetOrExportName);

  Decorator(targetOrExportName, prop, ControllerDecorationType.Export);
}

function Inject(getter: (context: any) => any) {
  return (target: any, prop: string | number | symbol) =>
    Decorator(target, prop, ControllerDecorationType.Inject, getter);
}

const $APPLIED_PROVIDE_DECORATIONS = Symbol('$APPLIED_PROVIDE_DECORATIONS');
const $PROVIDE_DECORATIONS = Symbol('$PROVIDE_DECORATIONS');

function Provide<TClass = any, TValue = any>(
  provider: (context: any, value: TValue) => void,
  getter: (target: TClass) => TValue
) {
  return (target: any) => {
    if (target[$PROVIDE_DECORATIONS] == null) target[$PROVIDE_DECORATIONS] = new Map();
    target[$PROVIDE_DECORATIONS].set(provider, getter);
  };
}

function applyProvideDecorations(target: any) {
  const decorations = (target.constructor[$PROVIDE_DECORATIONS] ?? new Map()) as Map<
    (context: any, value: any) => void,
    (target: any) => any
  >;

  if (target[$APPLIED_PROVIDE_DECORATIONS] == null) target[$APPLIED_PROVIDE_DECORATIONS] = new Set();

  for (const [provider, getter] of decorations) {
    if (target[$APPLIED_PROVIDE_DECORATIONS].has(provider)) continue;
    target[$APPLIED_PROVIDE_DECORATIONS].add(provider);

    provider(target.context, getter(target));
  }
}

export {
  Prop,
  Shared,
  Export,
  Inject,
  Provide,
  applyProvideDecorations,
  ControllerDecorationType,
  addControllerDecoration,
  applyControllerDecoration,
  applyControllerDecorations
};
