import { StylesheetData, StylesheetResolver, compileStylesheet } from './stylesheet';
import { cancelTemplateString } from './cancelTemplateString';
import { ViewData, compileView } from './view';
import { id } from './id';

interface ViewModuleData {
  styleScopeId: string;
  inserts: string[];
  views: ViewData[];
  stylesheets: StylesheetData[];
}

function createViewModule(): ViewModuleData {
  return { styleScopeId: id(), inserts: [], views: [], stylesheets: [] };
}

async function compileViewModule(viewModule: ViewModuleData, resolveStylesheet?: StylesheetResolver) {
  // prettier-ignore
  const stylesheetsCode = `[${viewModule.stylesheets.map(s => s.id + 'Stylesheet').join(',')}]`;

  const compiledViews: string[] = [];
  for (const view of viewModule.views) compiledViews.push(await compileView(view, viewModule.styleScopeId));

  const compiledStylesheets: string[] = [];
  for (const stylesheet of viewModule.stylesheets)
    compiledStylesheets.push(await compileStylesheet(stylesheet, resolveStylesheet));

  // prettier-ignore
  let code = "import { range } from '@uixjs/core';\nimport * as u from '@uixjs/core';\n" +
          viewModule.inserts.join('\n') + '\n' +
          compiledViews.join('\n') + '\n' +
          compiledStylesheets.join('\n') + '\n' +
          `const stylesheets = ${stylesheetsCode};` +
          'const defineComponent = info => u.defineComponent({ ...info, view: rootView, stylesheets: stylesheets.concat(info.stylesheets ?? []) });\n' +
          'export default defineComponent;\n' +
          'export { defineComponent, stylesheets, rootView as view };\n';

  // code += `console.log(\`${cancelTemplateString(code)}\`)`;

  return code;
}

export { ViewModuleData, createViewModule, compileViewModule };
