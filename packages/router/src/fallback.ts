import { Controller, createRegistry, defineComponent, view } from '@uixjs/core';

const routerUixRegistry = createRegistry('router');

const routerFallbackComponent = defineComponent({
  name: 'fallback',
  controller: Controller,
  view: view(null, '', () => [])
});

routerUixRegistry.components.register(routerFallbackComponent);
