import { StylesheetInfo } from '../style/StylesheetInfo';
import { Registry } from '../../Registry';
import { View } from '../view';

interface ComponentInfo {
  name: string;
  controller: any;
  view: View<any>;
  stylesheets: (StylesheetInfo & { registry?: Registry })[];
  dependencies: ((ComponentInfo | DeferredComponentInfo) & { registry?: Registry })[];
}

interface IncompleteComponentInfo {
  name: string;
  controller: any;
  view: View<any>;
  stylesheets?: (StylesheetInfo & { registry?: Registry })[];
  dependencies?: ((ComponentInfo | DeferredComponentInfo) & { registry?: Registry })[];
}

interface DeferredComponentInfo {
  name: string;
  load: () => Promise<ComponentInfo | { default: ComponentInfo }>;
}

function defineComponent(info: IncompleteComponentInfo): ComponentInfo {
  if (info.dependencies == null) info.dependencies = [];
  if (info.stylesheets == null) info.stylesheets = [];
  return info as ComponentInfo;
}

export { ComponentInfo, DeferredComponentInfo, defineComponent };
