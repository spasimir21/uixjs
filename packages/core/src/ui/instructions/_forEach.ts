import { TrackStack, effect, reactive } from '@uixjs/reactivity';
import { View, ViewInstance, viewToElement } from '../view';
import { Fragment } from '../fragment/Fragment';
import { scope } from '../../scope';

function _forEach(
  placeholder: HTMLElement,
  parentEls: Record<string, HTMLElement>,
  data: any,
  iteratorKey: string,
  getValues: () => any[],
  entryView: View<any>,
  emptyView: View<any> | null
) {
  const emptyViewInstance = emptyView ? emptyView.instantiate(data, parentEls) : null;
  const viewInstances: ViewInstance<any>[] = [];
  const fragment = new Fragment([]);

  const emptyViewElement = emptyViewInstance ? viewToElement(emptyViewInstance) : document.createComment('');

  let currentMounted = placeholder as ChildNode;
  currentMounted.replaceWith(document.createComment(''), currentMounted);

  const effectCleanup = effect(() => {
    const array = getValues();

    const lengthDelta = array.length - viewInstances.length;

    TrackStack.push();
    if (lengthDelta > 0) {
      for (let i = viewInstances.length; i < array.length; i++) {
        const viewInstance = entryView.instantiate(
          scope(reactive({ [iteratorKey]: array[i], [iteratorKey + 'Index']: i }), data),
          parentEls
        );

        fragment.appendChild(viewToElement(viewInstance));
        viewInstances.push(viewInstance);
      }
    } else if (lengthDelta < 0) {
      for (let i = 0; i > lengthDelta; i--) {
        fragment.removeChildAtIndex(fragment.nodes.length - 1);
        viewInstances[viewInstances.length - 1].cleanup();
        viewInstances.pop();
      }
    }
    TrackStack.pop();

    for (let i = 0; i < array.length; i++) viewInstances[i].data[iteratorKey] = array[i];

    const newMounted = array.length === 0 ? emptyViewElement : fragment;
    currentMounted.replaceWith(newMounted);
    currentMounted = newMounted;
  }).cleanup;

  return () => {
    effectCleanup();

    while (fragment.nodes.length > 0) fragment.removeChildAtIndex(0);
    if (emptyViewInstance) emptyViewInstance.cleanup();
    for (const view of viewInstances) view.cleanup();
  };
}

export { _forEach };
