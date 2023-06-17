import { cancelTemplateString } from './cancelTemplateString';
import { id } from './id';

function compile(source: string) {
  // prettier-ignore
  const stylesheetDataCode = `{ id: '${id()}', type: u.StylesheetType.Code, code: async () => \`${cancelTemplateString(source)}\` }`;
  return `import * as u from '@uixjs/core';\nexport default u.defineStylesheet(${stylesheetDataCode});`;
}

export { compile };
