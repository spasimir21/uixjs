import { UixComponent } from '../component/Component';
import { Controller } from '../../Controller';
import { Registry } from '../../Registry';
import { context } from '../../context';

function component(
  elements: Record<string, HTMLElement>,
  placeholderId: string,
  data: Controller & { styleScopeId: string },
  componentName: string,
  otherRegistry?: Registry | string
) {
  const fullComponentName = otherRegistry
    ? `${typeof otherRegistry === 'string' ? otherRegistry : otherRegistry.registryNamespace}--${componentName}`
    : `${data.component.registry.registryNamespace}--${componentName}`;

  const newComponent = document.createElement(fullComponentName) as UixComponent;
  if (data.styleScopeId) newComponent.setAttribute(data.styleScopeId, '');
  newComponent.isControlled = true;

  newComponent.context = context(newComponent.context, data.context);

  elements[placeholderId].replaceWith(newComponent);
  elements[placeholderId] = newComponent;

  return newComponent.kill.bind(newComponent);
}

function initComponent(component: UixComponent) {
  component.allowInitialization();
}

export { component, initComponent };
