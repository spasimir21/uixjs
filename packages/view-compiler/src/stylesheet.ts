import { cancelTemplateString } from './cancelTemplateString';
import { scopeCss } from './scopeCss';
import { id } from './id';

enum StylesheetType {
  Link,
  Code
}

interface LinkedStylesheetData {
  id: string;
  styleScopeId: string | null;
  type: StylesheetType.Link;
  href: string;
}

interface CodeStylesheetData {
  id: string;
  styleScopeId: string | null;
  type: StylesheetType.Code;
  code: string;
}

type StylesheetData = LinkedStylesheetData | CodeStylesheetData;

async function compileStylesheet(stylesheet: StylesheetData) {
  if (stylesheet.type === StylesheetType.Link) {
    const query = stylesheet.styleScopeId == null ? '' : `?styleScopeId=${stylesheet.styleScopeId}`;
    return `import ${stylesheet.id}Stylesheet from 'uix-stylesheet:${stylesheet.href}${query}';`;
  }

  let cssCode = stylesheet.code;
  if (stylesheet.styleScopeId != null) cssCode = await scopeCss(cssCode, stylesheet.styleScopeId);

  // prettier-ignore
  const stylesheetDataCode = `{ id: '${stylesheet.id}', type: u.StylesheetType.Code, code: async () => \`${cancelTemplateString(cssCode)}\` }`;
  return `const ${stylesheet.id}Stylesheet = u.defineStylesheet(${stylesheetDataCode});`;
}

async function compileStylesheetModule(source: string, styleScopeId: string | null) {
  if (styleScopeId != null) source = await scopeCss(source, styleScopeId);
  // prettier-ignore
  const stylesheetDataCode = `{ id: '${id()}', type: u.StylesheetType.Code, code: async () => \`${cancelTemplateString(source)}\` }`;
  return `import * as u from '@uixjs/core';\nexport default u.defineStylesheet(${stylesheetDataCode});`;
}

export { StylesheetData, StylesheetType, compileStylesheet, compileStylesheetModule };
