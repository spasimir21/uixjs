import { processElement } from './processors/processElement';
import { HTMLElement } from './node-html-parser';
import { ViewModuleData } from './module';
import { createView } from './view';
import { id } from './id';

function viewFromElement(element: HTMLElement, viewModule: ViewModuleData) {
  const viewFragment = new HTMLElement(null as any, {}, '', null, [0, 0]);
  for (const node of element.childNodes) {
    viewFragment.appendChild(node);
    element.removeChild(node);
  }

  const viewId = id();
  const view = createView(viewId, viewFragment);
  viewModule.views.unshift(view);

  processElement(viewFragment, view, viewModule);

  return view;
}

export { viewFromElement };
