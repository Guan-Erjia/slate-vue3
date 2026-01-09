import { BaseText, Descendant, Node } from "slate";
import { omit } from "./object";

export function getProperties<TNode extends Descendant>(
  node: TNode,
): Omit<TNode, TNode extends BaseText ? "text" : "children"> {
  return omit(
    node,
    (Node.isText(node) ? "text" : "children") as keyof TNode,
  ) as Omit<TNode, TNode extends BaseText ? "text" : "children">;
}
