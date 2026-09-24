import { Ancestor, Descendant, Editor, Range } from "slate";

export const nodeFragment = <T extends Ancestor = Editor>(
  editor: Editor,
  range: Range,
): T["children"] => {
  const [start, end] = Range.edges(range);

  /**
   * 判断 path 是否是 ancestorPath 的前缀。
   */
  const isPrefix = (ancestorPath: number[], path: number[]): boolean => {
    if (ancestorPath.length > path.length) {
      return false;
    }

    for (let i = 0; i < ancestorPath.length; i++) {
      if (ancestorPath[i] !== path[i]) {
        return false;
      }
    }

    return true;
  };

  const buildChildren = (
    children: Descendant[],
    path: number[],
  ): T["children"] => {
    const depth = path.length;

    const startInside = isPrefix(path, start.path);
    const endInside = isPrefix(path, end.path);

    let from = 0;
    let to = children.length;

    if (startInside) {
      from = start.path[depth];
    }

    if (endInside) {
      to = end.path[depth] + 1;
    }

    const result: T["children"] = [];

    for (let i = from; i < to; i++) {
      const child = children[i];
      const childPath = [...path, i];

      const isStartBoundary =
        startInside && start.path.length > depth && start.path[depth] === i;

      const isEndBoundary =
        endInside && end.path.length > depth && end.path[depth] === i;

      /**
       * 这个 child 是 start/end 路径上的边界，
       * 需要继续进入它。
       */
      if (isStartBoundary || isEndBoundary) {
        if ("text" in child) {
          let text = child.text;

          /**
           * start 和 end 落在同一个 leaf。
           */
          if (
            childPath.length === start.path.length &&
            childPath.length === end.path.length &&
            start.path.every((value, index) => value === end.path[index])
          ) {
            text = text.slice(start.offset, end.offset);
          } else {
            if (
              childPath.length === start.path.length &&
              start.path.every((value, index) => value === childPath[index])
            ) {
              text = text.slice(start.offset);
            }

            if (
              childPath.length === end.path.length &&
              end.path.every((value, index) => value === childPath[index])
            ) {
              text = text.slice(0, end.offset);
            }
          }

          result.push({
            ...child,
            text,
          });
        } else {
          /**
           * 只有边界 ancestor 需要 clone。
           */
          result.push({
            ...child,
            children: buildChildren(child.children, childPath),
          });
        }

        continue;
      }

      /**
       * 完整包含在 selection 中的 subtree。
       *
       * 不需要 clone。
       */
      result.push(child);
    }

    return result;
  };

  return buildChildren(editor.children, []);
};
