import selectorParser from 'postcss-selector-parser';
import postcss, { Root } from 'postcss';
import cssnano from 'cssnano';

const KEYFRAME_RULES = new Set(['keyframes', '-webkit-keyframes', '-moz-keyframes', '-o-keyframes']);

async function scopeCss(code: string, styleScopeId: string) {
  const selectorProcessor = selectorParser(selectors => {
    for (let i = 0; i < selectors.length; i++) {
      const scopeSelector = selectorParser.attribute({ attribute: styleScopeId } as any);
      const selector = selectors.at(i);

      const groups = selector.split(s => s.type === 'combinator');
      for (const group of groups) {
        let didInsert = false;
        for (let i = 0; i < group.length; i++) {
          if (group[i].type === 'tag' || group[i].type === 'root' || group[i].type === 'universal') continue;
          group.splice(i, 0, scopeSelector);
          didInsert = true;
          break;
        }

        if (!didInsert) group.push(scopeSelector);
      }

      selector.nodes = groups.flat();
    }
  });

  const cssProcessor = postcss()
    .use((root: Root) => {
      root.walkRules(rule => {
        if (rule.parent && KEYFRAME_RULES.has((rule.parent as any)?.name ?? '')) return;
        rule.selectors = rule.selectors.map(selector => selectorProcessor.processSync(selector));
      });
    })
    .use(cssnano);

  const processed = await cssProcessor.process(code, { from: undefined });
  return processed.css;
}

export { scopeCss };
