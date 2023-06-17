import { StylesheetInfo } from './StylesheetInfo';
import { Stylesheet } from './Stylesheet';
import { Registry } from '../../Registry';

class StylesheetRegistry {
  private readonly stylesheets = {} as Record<string, Stylesheet>;

  constructor(public readonly registryNamespace: string, public readonly registry: Registry) {}

  register(stylesheetInfo: StylesheetInfo) {
    if (stylesheetInfo.id in this.stylesheets) return;
    this.stylesheets[stylesheetInfo.id] = new Stylesheet(this.registryNamespace, stylesheetInfo);
  }

  isRegistered(id: string) {
    return id in this.stylesheets;
  }

  isLoaded(id: string) {
    if (!(id in this.stylesheets)) return false;
    return this.stylesheets[id].isLoaded;
  }

  async load(id: string) {
    if (!(id in this.stylesheets)) return;
    await this.stylesheets[id].load();
  }
}

export { StylesheetRegistry };
