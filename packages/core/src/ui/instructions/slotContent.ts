import { UixComponent } from '../component/Component';
import { View, viewToElement } from '../view';
import { effect } from '@uixjs/reactivity';

function slotContent(
  elements: Record<string, HTMLElement>,
  componentId: string,
  data: any,
  getSlotName: () => string,
  view: View<any>
) {
  const viewInstance = view.instantiate(data, elements);
  const viewElement = viewToElement(viewInstance);

  const effectCleanup = effect(
    () => getSlotName(),
    slotName => {
      (elements[componentId] as UixComponent).slots[slotName] = viewElement;
    }
  ).cleanup;

  return () => {
    effectCleanup();
    viewInstance.cleanup();
  };
}

export { slotContent };
