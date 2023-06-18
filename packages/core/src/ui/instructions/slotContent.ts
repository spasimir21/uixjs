import { UixComponent } from '../component/Component';
import { View, viewToElement } from '../view';

function slotContent(component: UixComponent, data: any, slotName: string, view: View<any>) {
  const viewInstance = view.instantiate(data);
  const viewElement = viewToElement(viewInstance);

  component.slots[slotName] = viewElement;

  return viewInstance.cleanup;
}

export { slotContent };
