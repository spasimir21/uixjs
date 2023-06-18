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
  const dataCode = `{ view: rootView, stylesheets: [${viewModule.stylesheets.map(s => s.id + 'Stylesheet').join(',')}] }`;

  const compiledStylesheets: string[] = [];
  for (const stylesheet of viewModule.stylesheets)
    compiledStylesheets.push(await compileStylesheet(stylesheet, resolveStylesheet));

  // prettier-ignore
  let code = "import { range } from '@uixjs/core';\nimport * as u from '@uixjs/core';\n" +
          viewModule.inserts.join('\n') + '\n' +
          viewModule.views.map(view => compileView(view, viewModule.styleScopeId)).join('\n') + '\n' +
          compiledStylesheets.join('\n') + '\n' +
          `const data = ${dataCode};\n` +
          'const defineComponent = info => u.defineComponent({ ...info, ...data });\n' +
          'export default defineComponent;\n' +
          'export { defineComponent };\n';

  // code += `console.log(\`${cancelTemplateString(code)}\`)`;

  return code;
}

export { ViewModuleData, createViewModule, compileViewModule };
