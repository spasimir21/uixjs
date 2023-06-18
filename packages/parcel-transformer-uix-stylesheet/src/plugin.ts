import { compileStylesheetModule } from '@uixjs/view-compiler';
import { Transformer } from '@parcel/plugin';

const stylesheetTransformer = new Transformer({
  transform: async ({ asset }) => {
    if (asset.type != 'css') return [asset];

    const cssCode = await asset.getCode();

    const moduleCode = await compileStylesheetModule(
      cssCode,
      asset.query.has('styleScopeId') ? asset.query.get('styleScopeId') : null
    );

    asset.type = 'js';
    asset.setCode(moduleCode);

    return [asset];
  }
});

export default stylesheetTransformer;
