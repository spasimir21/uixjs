import { ComponentRegistry } from './ui/component/ComponentRegistry';
import { StylesheetRegistry } from './ui/style/StylesheetRegistry';

class Registry {
  public readonly components: ComponentRegistry;
  public readonly styles: StylesheetRegistry;

  constructor(public readonly registryNamespace: string) {
    this.styles = new StylesheetRegistry(registryNamespace, this);
    this.components = new ComponentRegistry(registryNamespace, this);
  }
}

function createRegistry(registryNamespace: string) {
  return new Registry(registryNamespace);
}

export { Registry, createRegistry };
