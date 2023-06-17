import { effect } from '@uixjs/reactivity';

function textNode(elements: Record<string, HTMLElement>, placeholderId: string, textGetter: () => string) {
  const node = document.createTextNode('');

  elements[placeholderId].replaceWith(node);
  elements[placeholderId] = node as any;

  return effect(() => {
    node.textContent = textGetter();
  }).cleanup;
}

export { textNode };
