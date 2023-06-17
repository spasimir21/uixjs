import { provideRoute, provideRouter } from './routerContext';
import { UixComponent, context } from '@uixjs/core';
import { effect } from '@uixjs/reactivity';
import { Router } from './Router';

function routerView(element: HTMLElement, data: any, router: Router) {
  let currentComponent = document.createComment('') as any as HTMLElement;
  element.replaceWith(document.createComment(''), currentComponent);

  const effectCleanup = effect(
    () => {
      router.route.component;
      router.route.id;
    },
    () => {
      const newComponent = document.createElement(router.route.component) as UixComponent;
      if (data.styleScopeId) newComponent.setAttribute(data.styleScopeId, '');
      newComponent.isControlled = true;

      newComponent.context = context(newComponent.context, data.context);
      provideRoute(newComponent.context, router.route);
      provideRouter(newComponent.context, router);

      newComponent.allowInitialization();

      const prevComponent = currentComponent;

      currentComponent.replaceWith(newComponent);
      currentComponent = newComponent;

      if (prevComponent instanceof UixComponent) prevComponent.kill();
    }
  ).cleanup;

  return () => {
    effectCleanup();
    if (currentComponent instanceof UixComponent) currentComponent.kill();
  };
}

export { routerView };
