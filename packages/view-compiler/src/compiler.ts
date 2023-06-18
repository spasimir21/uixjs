import { compileViewModule, createViewModule } from './module';
import { processElement } from './processors/processElement';
import { StylesheetResolver } from './stylesheet';
import { parse } from './node-html-parser';
import { createView } from './view';

function compile(source: string, resolveStylesheet?: StylesheetResolver) {
  const html = parse(source);

  const viewModule = createViewModule();

  const rootView = createView('root', html);
  rootView.instructions.push(`u.booleanAttribute($.component, '${viewModule.styleScopeId}', () => true)`);
  viewModule.views.push(rootView);

  processElement(html, rootView, viewModule);

  return compileViewModule(viewModule, resolveStylesheet);
}

export { compile };
