import { Node, RemoveNodeOperation } from "slate";
import { getYTarget } from "../../utils/location";
import { XmlText } from "yjs";

export function removeNode(
  sharedRoot: XmlText,
  slateRoot: Node,
  op: RemoveNodeOperation
): void {
  const { yParent: parent, textRange } = getYTarget(
    sharedRoot,
    slateRoot,
    op.path
  );
  parent.delete(textRange.start, textRange.end - textRange.start);
}
