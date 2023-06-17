import './patches';

class Fragment extends Comment {
  constructor(readonly nodes: Node[]) {
    super();
    for (const node of this.nodes) (node as any).fragmentParent = this;
  }

  insertNodes() {
    if (this.parentNode == null) return;

    for (let i = this.nodes.length - 1; i >= 0; i--) {
      this.parentNode.insertBefore(this.nodes[i], this.nextSibling);
      if (this.nodes[i] instanceof Fragment) (this.nodes[i] as Fragment).insertNodes();
    }
  }

  removeNodes() {
    if (this.parentNode == null) return;
    for (const node of this.nodes) {
      if (node instanceof Fragment) node.removeNodes();
      this.parentNode.removeChild(node);
    }
  }

  override remove() {
    this.removeNodes();
    super.remove();
  }

  override replaceWith(...nodes: (string | Node)[]): void {
    this.removeNodes();
    super.replaceWith(...nodes);
  }

  override appendChild<T extends Node>(node: T): T {
    this.nodes.push(node);
    (node as any).fragmentParent = this;
    if (this.parentNode != null)
      this.parentNode.insertBefore(node, (this.nodes[this.nodes.length - 2] ?? this).nextSibling);
    if (node instanceof Fragment) node.insertNodes();
    return node;
  }

  override removeChild<T extends Node>(child: T): T {
    this.nodes.splice(
      this.nodes.findIndex(n => n === child),
      1
    );
    (child as any).fragmentParent = null;

    if (this.parentNode != null) this.parentNode.removeChild(child);
    return child;
  }

  removeChildAtIndex(index: number) {
    if (this.parentNode != null) this.parentNode.removeChild(this.nodes[index]);
    (this.nodes[index] as any).fragmentParent = null;
    this.nodes.splice(index, 1);
  }

  _replaceChildInNodeArray(child: Node, ...nodes: Node[]) {
    for (const node of nodes) (node as any).fragmentParent = this;
    const index = this.nodes.findIndex(n => n === child);
    this.nodes.splice(index, 1, ...nodes);
    (child as any).fragmentParent = null;
  }
}

export { Fragment };
