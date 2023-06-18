import { Node, NodeType } from '../node-html-parser';

function processComments(node: Node) {
  if (node.nodeType !== NodeType.COMMENT_NODE) return false;
  node.remove();
  return true;
}

export { processComments };
