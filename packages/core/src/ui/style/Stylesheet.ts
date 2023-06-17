import { StylesheetInfo, StylesheetType } from './StylesheetInfo';

class Stylesheet {
  private isLoading: boolean = false;
  isLoaded: boolean = false;

  constructor(public readonly registryNamespace: string, public readonly stylesheetInfo: StylesheetInfo) {
    this.isLoaded =
      document.head.querySelector(`[uix-s='${this.registryNamespace}--${this.stylesheetInfo.id}']`) != null;
  }

  async load() {
    if (this.isLoaded || this.isLoading) return;
    this.isLoading = true;

    let element;
    if (this.stylesheetInfo.type === StylesheetType.Code) {
      element = document.createElement('style');
      element.textContent = await this.stylesheetInfo.code();
    } else {
      element = document.createElement('link');
      element.setAttribute('rel', 'stylesheet');
      element.setAttribute('href', this.stylesheetInfo.link);
    }

    element.setAttribute('uix-s', `${this.registryNamespace}--${this.stylesheetInfo.id}`);

    document.head.appendChild(element);

    this.isLoading = false;
    this.isLoaded = true;
  }
}

export { Stylesheet };
