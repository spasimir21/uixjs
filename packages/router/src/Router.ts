import { Effect, Reactive, reactive } from '@uixjs/reactivity';
import { GotoLocation, gotoLocation } from './goto';
import { id } from './helpers/id';
import {
  ProcessedRouteDefinition,
  Route,
  RouteComponent,
  RouteDefinition,
  getRouteComponentNodeName,
  matchLocationToRoute,
  processRouteDefinition
} from './routes';

@Reactive
class Router {
  public readonly route: Route = reactive({}) as any;

  private readonly routeDefinitions: Record<string, ProcessedRouteDefinition> = {};
  private readonly fallbackComponent: string;

  constructor(routeDefinitions: RouteDefinition[], fallbackComponent: RouteComponent = 'router--fallback') {
    for (const routeDefinition of routeDefinitions) processRouteDefinition(routeDefinition, '', this.routeDefinitions);

    this.fallbackComponent = getRouteComponentNodeName(fallbackComponent);
    this.updateRoute();

    window.addEventListener('popstate', this.updateRoute.bind(this));
  }

  goto(location: GotoLocation) {
    gotoLocation(location, this.routeDefinitions);
    this.updateRoute();
  }

  refresh() {
    this.route.id = id();
  }

  private updateRoute() {
    const newRoute = matchLocationToRoute(window.location, this.routeDefinitions, this.fallbackComponent);
    for (const key in newRoute) {
      if (key === 'id' && newRoute.component === this.route.component) continue;
      this.route[key as keyof Route] = newRoute[key as keyof Route] as any;
    }
  }

  @Effect
  private updatePageTitle() {
    if (this.route.title == null) return;
    document.title = this.route.title;
  }
}

export { Router };
