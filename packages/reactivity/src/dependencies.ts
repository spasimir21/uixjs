const $DEPENDENCY_CLEANUPS = Symbol('$DEPENDENCY_CLEANUPS');

interface ReactiveDependency<T> {
  dependency: T;
  cleanup: () => void;
}

function registerDependency<T>(target: any, dependency: T | ReactiveDependency<T>): T {
  if (target[$DEPENDENCY_CLEANUPS] == null) target[$DEPENDENCY_CLEANUPS] = [];
  target[$DEPENDENCY_CLEANUPS].push((dependency as any).cleanup ?? (() => {}));
  return (dependency as any).dependency ?? dependency;
}

function cleanupDependencies(target: any) {
  if (target[$DEPENDENCY_CLEANUPS] == null) return;
  for (const cleanup of target[$DEPENDENCY_CLEANUPS]) cleanup();
  target[$DEPENDENCY_CLEANUPS] = [];
}

export { registerDependency, cleanupDependencies, ReactiveDependency };
