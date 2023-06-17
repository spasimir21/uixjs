import { ComponentInfo, DeferredComponentInfo, Registry } from '@uixjs/core';
import { cancelSpecialRegExpChars } from './helpers/cancelRegExpChars';
import { id } from './helpers/id';

type RouteComponent =
  | string
  | {
      registry: Registry | string;
      component: string | ComponentInfo | DeferredComponentInfo;
    };

function getRouteComponentNodeName(routeComponent: RouteComponent): string {
  if (typeof routeComponent === 'string') return routeComponent;

  const namespace =
    typeof routeComponent.registry === 'string' ? routeComponent.registry : routeComponent.registry.registryNamespace;

  const componentName =
    typeof routeComponent.component === 'string' ? routeComponent.component : routeComponent.component.name;

  return `${namespace}--${componentName}`;
}

interface RouteDefinition {
  name: string;
  title?: string | ((route: Route) => string);
  path: string;
  component: RouteComponent;
  children?: RouteDefinition[];
}

interface ProcessedRouteDefinition {
  name: string;
  title: string | ((route: Route) => string) | null;
  stringPath: string;
  path: RegExp;
  component: string;
}

function pathToRegExp(path: string) {
  if (!path.endsWith('/')) path += '/';
  return new RegExp(cancelSpecialRegExpChars(path).replace(/\/:(.+?)(?=\/)/g, (_, name) => `/(?<${name}>.+?)`));
}

function processRouteDefinition(
  routeDefinition: RouteDefinition,
  parentPath: string = '',
  routes: Record<string, ProcessedRouteDefinition> = {}
) {
  if (routeDefinition.children)
    for (const child of routeDefinition.children) processRouteDefinition(child, routeDefinition.path, routes);

  routes[routeDefinition.name] = {
    name: routeDefinition.name,
    title: routeDefinition.title ?? null,
    stringPath: parentPath + routeDefinition.path,
    path: pathToRegExp(parentPath + routeDefinition.path),
    component: getRouteComponentNodeName(routeDefinition.component)
  };

  return routes;
}

function matchPath(pathname: string, path: RegExp) {
  if (!pathname.endsWith('/')) pathname += '/';

  const match = pathname.match(path);
  if (match == null || match[0].length < pathname.length) return null;

  return match.groups ?? {};
}

interface Route {
  id: string;
  title: string | null;
  name: string;
  component: string;
  path: string;
  params: Record<string, string>;
  search: URLSearchParams;
  hash: string;
}

function matchLocationToRoute(
  location: Location,
  routeDefs: Record<string, ProcessedRouteDefinition>,
  fallbackComponent: string
): Route {
  let matchedRouteDef = null;
  let matchedParams = null;

  for (const routeName in routeDefs) {
    const routeDef = routeDefs[routeName];

    const params = matchPath(location.pathname, routeDef.path);
    if (params == null) continue;

    matchedRouteDef = routeDef;
    matchedParams = params;
  }

  const route: Route = {
    id: id(),
    title: null,
    name: matchedRouteDef ? matchedRouteDef.name : '_fallback',
    component: matchedRouteDef ? matchedRouteDef.component : fallbackComponent,
    path: location.pathname,
    params: matchedParams ?? {},
    search: new URLSearchParams(location.search),
    hash: location.hash.slice(1)
  };

  if (matchedRouteDef?.title != null)
    route.title = typeof matchedRouteDef.title === 'string' ? matchedRouteDef.title : matchedRouteDef.title(route);

  return route;
}

export {
  RouteDefinition,
  ProcessedRouteDefinition,
  Route,
  RouteComponent,
  processRouteDefinition,
  matchLocationToRoute,
  getRouteComponentNodeName
};
