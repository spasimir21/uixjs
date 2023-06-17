import { ComponentInfo, DeferredComponentInfo } from './ComponentInfo';
import { createComponentClassForRegistry } from './Component';
import { Registry } from '../../Registry';

class ComponentRegistry {
  private readonly componentInfoCallbacks = {} as Record<string, ((componentInfo: ComponentInfo) => void)[]>;
  private readonly deferredComponentInfos = {} as Record<string, DeferredComponentInfo>;
  private readonly componentInfos = {} as Record<string, ComponentInfo>;

  constructor(public readonly registryNamespace: string, public readonly registry: Registry) {}

  register(componentInfo: ComponentInfo | DeferredComponentInfo) {
    const componentName = componentInfo.name;

    if (componentName in this.componentInfos || componentName in this.deferredComponentInfos) return;

    const nodeName = `${this.registryNamespace}--${componentName}`;

    if (customElements.get(nodeName) == null)
      customElements.define(nodeName, createComponentClassForRegistry(componentName, this.registry));

    if ('load' in componentInfo) {
      this.deferredComponentInfos[componentName] = componentInfo;
      if (componentName in this.componentInfoCallbacks) this.loadDeferredComponentInfo(componentName);
      return;
    }

    this.componentInfos[componentName] = componentInfo;

    for (const stylesheet of componentInfo.stylesheets) {
      const stylesheetRegistry = stylesheet.registry ? stylesheet.registry.styles : this.registry.styles;
      stylesheetRegistry.register(stylesheet);
    }

    for (const compInfo of componentInfo.dependencies) {
      const compRegistry = compInfo.registry ? compInfo.registry.components : this;
      compRegistry.register(compInfo);
    }

    if (componentName in this.componentInfoCallbacks) {
      for (const callback of this.componentInfoCallbacks[componentName]) callback(componentInfo);
      delete this.componentInfoCallbacks[componentName];
    }
  }

  onComponentInfoPresent(name: string, callback: (componentInfo: ComponentInfo) => void) {
    if (name in this.componentInfos) {
      callback(this.componentInfos[name]);
      return;
    }

    if (!(name in this.componentInfoCallbacks)) this.componentInfoCallbacks[name] = [];
    this.componentInfoCallbacks[name].push(callback);

    if (name in this.deferredComponentInfos) this.loadDeferredComponentInfo(name);
  }

  private async loadDeferredComponentInfo(name: string) {
    this.deferredComponentInfos[name].load().then(info => this.register('default' in info ? info.default : info));
    delete this.deferredComponentInfos[name];
  }
}

export { ComponentRegistry };
