import { Transformer } from '@parcel/plugin';
import { compile } from './compiler';

const viewTransformer = new Transformer({
  transform: async ({ asset }) => {
    const code = await asset.getCode();

    asset.type = 'js';
    asset.setCode(await compile(code));

    return [asset];
  }
});

export default viewTransformer;
