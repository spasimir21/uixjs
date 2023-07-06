import { registerDependency } from '../dependencies';
import { ComputedNode } from '../nodes/ComputedNode';
import { EffectNode } from '../nodes/EffectNode';
import { StateNode } from '../nodes/StateNode';

enum DecorationType {
  State,
  Computed,
  Effect,
  Dependency
}

type Decoration = { type: DecorationType; data: any };

type Decorations = Record<string | number | symbol, Decoration>;

const DECORATION_APPLICATION_ORDER = [
  DecorationType.State,
  DecorationType.Computed,
  DecorationType.Dependency,
  DecorationType.Effect
];

const $DECORATIONS = Symbol('$DECORATIONS');
const $NODES = Symbol('$NODES');

function addDecoration(target: any, prop: string | number | symbol, type: DecorationType, data?: any) {
  if (target[$DECORATIONS] == null) target[$DECORATIONS] = {};
  target[$DECORATIONS][prop] = { type, data };
}

function applyStateDecoration(target: any, prop: string | number | symbol) {
  const node = new StateNode(target[prop]);

  Object.defineProperty(target, prop, {
    configurable: false,
    get: () => node.value,
    set: newValue => (node.value = newValue)
  });

  return node;
}

function applyEffectDecoration(target: any, prop: string | number | symbol, callback: Function) {
  const node = new EffectNode(callback.bind(target));
  target[prop] = node.execute;
  return node;
}

interface ComputedDecorationData {
  getter: () => any;
  descriptor: PropertyDescriptor;
  isStatic: boolean;
}

function applyComputedDecoration(target: any, prop: string | number | symbol, data: ComputedDecorationData) {
  const node = new ComputedNode(data.getter.bind(target));

  if (!data.isStatic) {
    Object.defineProperty(target, prop, {
      configurable: false,
      get: () => node.value
    });
  } else {
    data.descriptor.configurable = false;
    data.descriptor.get = () => node.value;
  }

  return node;
}

function applyDependencyDecoration(target: any, prop: string | number | symbol, initializer?: (target: any) => any) {
  const value = initializer ? initializer(target) : target[prop];
  target[prop] = registerDependency(target, value);
}

function applyDecoration(target: any, prop: string | number | symbol, decoration: Decoration) {
  if (target[$NODES] == null) target[$NODES] = {};
  if (target[$NODES][prop] != null) return;

  // prettier-ignore
  const applicationFunction =
      decoration.type === DecorationType.State ? applyStateDecoration
    : decoration.type === DecorationType.Computed ? applyComputedDecoration
    : decoration.type === DecorationType.Dependency ? applyDependencyDecoration
    : applyEffectDecoration;

  const node = applicationFunction(target, prop, decoration.data);

  if (node) target[$NODES][prop] = node;

  return node;
}

function applyDecorations(
  target: any,
  types: DecorationType[] = DECORATION_APPLICATION_ORDER,
  decorations?: Decorations
) {
  if (decorations == null) decorations = (target[$DECORATIONS] ?? {}) as Decorations;

  for (const decorationType of types) {
    for (const prop in decorations) {
      const decoration = decorations[prop];
      if (decoration.type !== decorationType) continue;
      applyDecoration(target, prop, decoration);
    }
  }
}

function cleanupDecorations(target: any) {
  const nodes = target[$NODES] ?? {};
  for (const prop in nodes) {
    if ('cleanup' in nodes[prop]) nodes[prop].cleanup();
    delete nodes[prop];
  }
}

export { Decorations, DecorationType, addDecoration, applyDecorations, cleanupDecorations, applyDecoration };
