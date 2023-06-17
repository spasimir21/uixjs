import { ProcessedRouteDefinition } from './routes';

type GotoLocation =
  | string
  | (({} | { path: string } | { route: string; params?: any }) & { hash?: string; search?: any });

function insertPathParams(path: string, params: any) {
  for (const key in params) path = path.replaceAll(`:${key}`, params[key]);
  return path;
}

function gotoLocation(location: GotoLocation, routeDefinitions: Record<string, ProcessedRouteDefinition>) {
  if (typeof location === 'string') {
    history.pushState(null, '', location);
    return;
  }

  // prettier-ignore
  let path =
      'path' in location ? location.path
    : 'route' in location ? insertPathParams(routeDefinitions[location.route].stringPath, location.params ?? {})
    : window.location.pathname;

  path +=
    location.search != null
      ? (location.search instanceof URLSearchParams ? location.search : new URLSearchParams(location.search)).toString()
      : window.location.search;

  path += location.hash != null ? `#${location.hash}` : window.location.hash;

  history.pushState(null, '', path);
}

export { GotoLocation, gotoLocation };
