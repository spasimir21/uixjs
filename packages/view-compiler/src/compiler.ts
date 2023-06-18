import { compileViewModule, createViewModule } from './module';
import { processElement } from './processors/processElement';
import { parse } from './node-html-parser';
import { createView } from './view';

function compile(source: string) {
  const html = parse(source);

  const viewModule = createViewModule();

  const rootView = createView('root', html);
  rootView.instructions.push(`u.booleanAttribute($.component, '${viewModule.styleScopeId}', () => true)`);
  viewModule.views.push(rootView);

  processElement(html, rootView, viewModule);

  return compileViewModule(viewModule);
}

export { compile };
