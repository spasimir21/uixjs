import { createContextValue } from '@uixjs/core';
import { Router } from './Router';
import { Route } from './routes';

const [provideRouter, getRouter] = createContextValue<Router>('router');

const [provideRoute, getRoute] = createContextValue<Route>('route');

export { provideRouter, getRouter, provideRoute, getRoute };
