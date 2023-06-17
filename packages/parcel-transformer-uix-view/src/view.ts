import { cancelTemplateString } from './cancelTemplateString';
import { addStyleScopeIdToElement } from './addStyleScopeId';
import { HTMLElement } from './node-html-parser';
import { minify } from '@minify-html/node';

interface ViewData {
  name: string;
  element: HTMLElement;
  instructions: string[];
}

function createView(name: string, element: HTMLElement): ViewData {
  return { name, element, instructions: [] };
}

function compileView(view: ViewData, styleScopeId: string) {
  // addStyleScopeIdToElement(view.element, styleScopeId);
  const htmlCode = minify(Buffer.from(view.element.outerHTML), {}).toString();

  // prettier-ignore
  return `const ${view.name}View = u.view('${styleScopeId}', \`${cancelTemplateString(htmlCode)}\`, (e, $) => [${view.instructions.join(',')}]);`;
}

export { compileView, createView, ViewData };
