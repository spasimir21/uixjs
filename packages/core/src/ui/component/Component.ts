import { Reactive, State, reactive } from '@uixjs/reactivity';
import { ComponentInfo } from './ComponentInfo';
import { Controller } from '../../Controller';
import { Registry } from '../../Registry';
import { ViewInstance } from '../view';

// This class cannot have any private/protected memebers because of the createComponentClassForRegistry function
// I don't know why; it seems like a typescript bug
@Reactive
class UixComponent extends HTMLElement {
  componentInfo: ComponentInfo = null as any;
  readonly componentName: string;
  readonly registry: Registry;
  canInitialize = false;
  @State
  isInitialized = false;
  isControlled = false;
  isRendered = false;
  isLoaded = false;
  @State
  isKilled = false;

  controller: Controller = null as any;
  view: ViewInstance<Controller> = null as any;

  @State
  readonly _attributes: any = {};
  @State
  readonly _exports: any = {};
  @State
  readonly props: any = {};
  @State
  readonly shared: any = {};

  context: any = reactive({});

  constructor() {
    super();

    this.registry = this.getRegistry();

    this.componentName = this.getComponentName();

    setTimeout(() => this.allowInitialization(), 0);
  }

  getRegistry(): Registry {
    return null as any;
  }

  getComponentName(): string {
    return '';
  }

  allowInitialization() {
    if (this.canInitialize) return;
    this.canInitialize = true;

    this.registry.components.onComponentInfoPresent(this.componentName, this.onLoaded.bind(this));

    this.setAttribute(this.componentName, '');
  }

  onLoaded(componentInfo: ComponentInfo) {
    if (this.isLoaded || this.isKilled) return;

    this.componentInfo = componentInfo;
    this.isLoaded = true;

    this.init();
  }

  init() {
    if (this.isInitialized || this.isKilled) return;

    for (const attribute of this.attributes) this._attributes[attribute.name] = attribute.value;

    this.controller = new this.componentInfo.controller(
      this,
      this._attributes,
      this.props,
      this._exports,
      this.shared,
      this.context
    );

    this.controller.$init();

    this.view = this.componentInfo.view.instantiate(this.controller);

    this.isInitialized = true;

    this.render();
  }

  render() {
    if (!this.isConnected || this.isRendered || !this.isInitialized || this.isKilled) return;
    this.append(...this.view.rootElement.childNodes);

    for (const stylesheet of this.componentInfo.stylesheets) this.registry.styles.load(stylesheet.id);

    this.isRendered = true;

    this.controller.$onFirstMount();
    this.controller.$onMount();
  }

  kill() {
    if (this.isKilled) return;

    if (this.view) this.view.cleanup();
    this.view = null as any;

    if (this.controller) this.controller.cleanup();
    this.controller = null as any;

    this.innerHTML = '';

    this.isKilled = true;
    this.remove();
  }

  connectedCallback() {
    if (!this.isInitialized || this.isKilled) return;
    this.render();
    this.controller.$onMount();
  }

  disconnectedCallback() {
    if (!this.isInitialized || this.isKilled) return;
    this.controller.$onUnmount();
    if (!this.isControlled) this.kill();
  }
}

function createComponentClassForRegistry(name: string, registry: Registry) {
  return class extends UixComponent {
    override getComponentName(): string {
      return name;
    }

    override getRegistry(): Registry {
      return registry;
    }
  };
}

export { UixComponent, createComponentClassForRegistry };
