const path = require('path');
const fs = require('fs');

function camelCaseToKebab(name) {
  return name
    .split(/(?=[A-Z])/)
    .map(part => part.toLowerCase())
    .join('-');
}

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function addComponent(rootDir, componentName, hasStyle) {
  const componentDir = path.join(rootDir, componentName);

  fs.mkdirSync(componentDir, { recursive: true });

  fs.writeFileSync(
    path.join(componentDir, `${componentName}.view.html`),
    `${hasStyle ? `<link rel="stylesheet" href="./${componentName}.style.scss" scoped />` : ''}
`
  );

  fs.writeFileSync(
    path.join(componentDir, `${componentName}.component.ts`),
    `import defineComponent from './${componentName}.view.html';
import { Controller } from '@uixjs/core';

class ${capitalize(componentName)}Controller extends Controller {
}
  
const ${componentName}Component = defineComponent({
  name: '${camelCaseToKebab(componentName)}',
  controller: ${capitalize(componentName)}Controller
});
  
export default ${componentName}Component;
export { ${componentName}Component }; 
`
  );

  if (hasStyle) fs.writeFileSync(path.join(componentDir, `${componentName}.style.scss`), '');
}

module.exports = { addComponent };
