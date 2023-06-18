import { compile } from '@uixjs/view-compiler';
import { Transformer } from '@parcel/plugin';

const viewTransformer = new Transformer({
  transform: async ({ asset }) => {
    const code = await asset.getCode();

    asset.type = 'js';
    asset.setCode(await compile(code));

    return [asset];
  }
});

export default viewTransformer;
