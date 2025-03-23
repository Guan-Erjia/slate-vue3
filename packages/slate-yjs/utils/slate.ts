import { BaseText, Descendant, Text } from 'slate';
import { omit } from 'lodash-es';

export function getProperties<TNode extends Descendant>(
  node: TNode
): Omit<TNode, TNode extends BaseText ? 'text' : 'children'> {
  return omit(
    node,
    (Text.isText(node) ? 'text' : 'children') as keyof TNode
  ) as Omit<TNode, TNode extends BaseText ? 'text' : 'children'>;
}
