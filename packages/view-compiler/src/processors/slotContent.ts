import { Node, HTMLElement } from '../node-html-parser';
import { ComponentIdStack } from '../componentIdStack';
import { viewFromElement } from '../viewFromElement';
import { ViewModuleData } from '../module';
import { ViewData } from '../view';

function processSlotContent(element: Node, view: ViewData, viewModule: ViewModuleData) {
  if (!(element instanceof HTMLElement) || element.tagName !== 'CONTENT') return false;

  const contentView = viewFromElement(element, viewModule);

  const slotNameCode = element.getAttribute(':slot') ?? `'${element.getAttribute('slot')}'`;

  view.instructions.push(
    `u.slotContent($['${ComponentIdStack.peek()}'], $, (${slotNameCode}), ${contentView.name}View)`
  );

  element.remove();

  return true;
}

export { processSlotContent };
