import { processComponent, processComponentInit } from './component';
import { processBooleanAttributes } from './booleanAttribute';
import { processComponentTag } from './componentTag';
import { processStyleProps } from './styleProp';
import { processModifiers } from './modifiers';
import { processComments } from './comment';
import { Node } from '../node-html-parser';
import { processAttributes } from './attr';
import { processIgnored } from './ignored';
import { ViewModuleData } from '../module';
import { processExports } from './_export';
import { processClasses } from './_class';
import { processDirect } from './direct';
import { processShared } from './shared';
import { processInsert } from './insert';
import { processInputs } from './input';
import { processEvents } from './event';
import { isRemoved } from '../removed';
import { processStyle } from './style';
import { processProps } from './prop';
import { processEach } from './_each';
import { processText } from './text';
import { processRef } from './ref';
import { ViewData } from '../view';
import { processIf } from './if';

type Processor = (node: Node, view: ViewData, viewModule: ViewModuleData) => boolean;

const PROCESSORS: Processor[] = [
  processComments,
  processText,
  processIgnored,
  processInsert,
  processStyle,
  processIf,
  processEach,
  processComponent,
  processAttributes,
  processBooleanAttributes,
  processStyleProps,
  processModifiers,
  processClasses,
  processDirect,
  processEvents,
  processRef,
  processInputs,
  processProps,
  processShared,
  processComponentInit,
  processExports,
  processComponentTag
];

function processElement(node: Node, view: ViewData, viewModule: ViewModuleData) {
  if (isRemoved(node)) return;

  for (const processor of PROCESSORS) {
    if (processor(node, view, viewModule)) return;
  }

  for (const child of node.childNodes) processElement(child, view, viewModule);
}

export { processElement };
