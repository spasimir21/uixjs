const { addComponent } = require('./addComponent.js');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const TOKEN_SCOPES = [
  'meta.tag.other.unrecognized.html.derivative entity.name.tag.html',
  'meta.tag.custom.start.html entity.name.tag.html',
  'meta.tag.custom.end.html entity.name.tag.html'
];

const TOKEN_COLOR = '#FFCB6B';

const SHIMS = `declare module '*.view.html' {
  import { IncompleteComponentInfo, View, StylesheetInfo } from '@uixjs/core';

  type IncompleteComponentInfoWithoutView = Omit<IncompleteComponentInfo, 'view'>;

  const defineComponent: (info: IncompleteComponentInfoWithoutView) => ComponentInfo;
  const stylesheets: StylesheetInfo[];
  const view: View<any>;

  export default defineComponent;
  export {
    defineComponent,
    view,
    stylesheets,
    ComponentInfo,
    View,
    StylesheetInfo,
    IncompleteComponentInfo,
    IncompleteComponentInfoWithoutView
  };
}
`;

function modifySettings(settings) {
  if (!('editor.tokenColorCustomizations' in settings)) settings['editor.tokenColorCustomizations'] = {};
  const tokenColorCustomizations = settings['editor.tokenColorCustomizations'];

  if (!('textMateRules' in tokenColorCustomizations)) tokenColorCustomizations['textMateRules'] = [];
  const textMateRules = tokenColorCustomizations['textMateRules'];

  for (const scope of TOKEN_SCOPES) {
    let hasRule = false;
    for (const rule of textMateRules) {
      if (rule.scope !== scope) continue;
      hasRule = true;
      break;
    }

    if (hasRule) continue;

    textMateRules.push({
      scope,
      settings: { foreground: TOKEN_COLOR }
    });
  }
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('uix.addVsCodeSettings', () => {
      const projectPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
      fs.mkdirSync(path.join(projectPath, '.vscode'), { recursive: true });

      const settingsPath = path.join(projectPath, '.vscode/settings.json');
      const settingsExist = fs.existsSync(settingsPath);
      const settings = settingsExist ? JSON.parse(fs.readFileSync(settingsPath).toString()) : {};
      modifySettings(settings);
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('uix.addShims', uri => {
      let projectPath = uri ? uri.fsPath : vscode.workspace.workspaceFolders[0].uri.fsPath;
      if (fs.statSync(projectPath).isFile()) projectPath = path.dirname(projectPath);

      const shimsPath = path.join(projectPath, 'shims-uix.d.ts');
      fs.writeFileSync(shimsPath, SHIMS);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('uix.addParcelConfig', () => {
      const projectPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

      const configPath = path.join(projectPath, '.parcelrc');
      const configExist = fs.existsSync(configPath);
      const config = configExist ? JSON.parse(fs.readFileSync(configPath).toString()) : { extends: '@parcel/config-default' };

      if (!('transformers' in config)) config['transformers'] = {};

      config['transformers']['*.view.html'] = ['@uixjs/parcel-transformer-uix-view'];
      config['transformers']['uix-stylesheet:*'] = ['...', '@uixjs/parcel-transformer-uix-stylesheet'];

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('uix.addComponent', async uri => {
      let projectPath = uri ? uri.fsPath : vscode.workspace.workspaceFolders[0].uri.fsPath;
      if (fs.statSync(projectPath).isFile()) projectPath = path.dirname(projectPath);

      const componentName = await vscode.window.showInputBox({
        placeHolder: 'Component Name',
        prompt: 'The name of the component (camelCase)'
      });

      const hasStyleInput = await vscode.window.showInputBox({
        placeHolder: 'Has Style',
        prompt: 'Does the component have a style (y/n)'
      });

      const hasStyle = hasStyleInput.trim() === 'y' || hasStyleInput.trim() === 'yes' || hasStyleInput.trim() === 'true';

      addComponent(projectPath, componentName, hasStyle);
    })
  );
}

module.exports = { activate };
