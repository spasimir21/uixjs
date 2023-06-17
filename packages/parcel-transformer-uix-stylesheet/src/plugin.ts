import { Transformer } from '@parcel/plugin';
import { scopeCss } from './scopeCss';
import { compile } from './compile';

const stylesheetTransformer = new Transformer({
  transform: async ({ asset }) => {
    if (asset.type != 'css') return [asset];

    let cssCode = await asset.getCode();

    if (asset.query.has('styleScopeId')) cssCode = await scopeCss(cssCode, asset.query.get('styleScopeId') as string);

    asset.type = 'js';
    asset.setCode(compile(cssCode));

    return [asset];
  }
});

export { stylesheetTransformer };
