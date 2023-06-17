import { Fragment } from './Fragment';

const _appendChild = Node.prototype.appendChild;

Node.prototype.appendChild = function <T extends Node>(node: T) {
  const result = _appendChild.call(this, node) as T;
  if (node instanceof Fragment) node.insertNodes();
  return result;
};

const _removeChild = Node.prototype.removeChild;

Node.prototype.removeChild = function <T extends Node>(node: T) {
  if (node instanceof Fragment) node.removeNodes();
  try {
    return _removeChild.call(this, node) as T;
  } catch (err) {
    return node;
  }
};

const _Element_replaceWith = Element.prototype.replaceWith;

Element.prototype.replaceWith = function (...nodes: (string | Node)[]) {
  _Element_replaceWith.call(this, ...nodes);

  if ((this as any).fragmentParent != null)
    ((this as any).fragmentParent as Fragment)._replaceChildInNodeArray(this, ...(nodes as any[]));

  for (const node of nodes) if (node instanceof Fragment) node.insertNodes();
};

const _CharacterData_replaceWith = CharacterData.prototype.replaceWith;

CharacterData.prototype.replaceWith = function (...nodes: (string | Node)[]) {
  _CharacterData_replaceWith.call(this, ...nodes);

  if ((this as any).fragmentParent != null)
    ((this as any).fragmentParent as Fragment)._replaceChildInNodeArray(this, ...(nodes as any[]));

  for (const node of nodes) if (node instanceof Fragment) node.insertNodes();
};
