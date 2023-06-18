import { TrackStack, effect, reactive } from '@uixjs/reactivity';
import { View, ViewInstance, viewToElement } from '../view';
import { Fragment } from '../fragment/Fragment';
import { scope } from '../../scope';

type Key = string | number;

function _forEachKeyed(
  placeholder: HTMLElement,
  data: any,
  iteratorKey: string,
  getValues: () => any[],
  getKey: (item: any) => Key,
  entryView: View<any>,
  emptyView: View<any> | null
) {
  const viewInstances: Record<Key, ViewInstance<any>> = {};
  const viewElements: Record<Key, ChildNode> = {};
  let keys: Key[] = [];

  const emptyViewInstance = emptyView ? emptyView.instantiate(data) : null;
  const fragment = new Fragment([]);

  const emptyViewElement = emptyViewInstance ? viewToElement(emptyViewInstance) : document.createComment('');

  let currentMounted = placeholder as ChildNode;
  currentMounted.replaceWith(document.createComment(''), currentMounted);

  const effectCleanup = effect(() => {
    const array = getValues();

    const newKeys = new Array<Key>(array.length);
    for (let i = 0; i < array.length; i++) newKeys[i] = getKey(array[i]);

    TrackStack.push();
    const keysToCleanup = new Set<Key>(Object.keys(viewInstances));
    for (let i = 0; i < array.length; i++) {
      const key = newKeys[i];

      keysToCleanup.delete(key);
      if (key in viewInstances) continue;

      const viewInstance = entryView.instantiate(
        scope(reactive({ [iteratorKey]: array[i], [iteratorKey + 'Key']: key }), data)
      );

      viewInstances[key] = viewInstance;
      viewElements[key] = viewToElement(viewInstance);
    }

    const tempSwapPlaceholders: Record<Key, Comment> = {};
    for (let i = 0; i < newKeys.length; i++) {
      const newKey = newKeys[i];
      const key = keys[i];

      if (key == null) {
        fragment.appendChild(viewElements[newKey]);
        continue;
      }

      if (newKey !== key) {
        tempSwapPlaceholders[newKey] = document.createComment('');
        viewElements[newKey].replaceWith(tempSwapPlaceholders[newKey]);

        if (key in tempSwapPlaceholders) tempSwapPlaceholders[key].replaceWith(viewElements[newKey]);
        else viewElements[key].replaceWith(viewElements[newKey]);
      }
    }

    for (const key in tempSwapPlaceholders) tempSwapPlaceholders[key].remove();

    for (const key of keysToCleanup) {
      viewElements[key].remove();
      viewInstances[key].cleanup();

      delete viewElements[key];
      delete viewInstances[key];
    }

    keys = newKeys;

    const newMounted = array.length === 0 ? emptyViewElement : fragment;
    currentMounted.replaceWith(newMounted);
    currentMounted = newMounted;
    TrackStack.pop();
  }).cleanup;

  return () => {
    effectCleanup();

    while (fragment.nodes.length > 0) fragment.removeChildAtIndex(0);
    for (const key in viewInstances) viewInstances[key].cleanup();
    if (emptyViewInstance) emptyViewInstance.cleanup();
  };
}

export { _forEachKeyed };
