import { omit } from "lodash-es";
import { Ref, VNode, VNodeProps, VNodeRef } from "vue";

export const useInheritRefAttrs = (
  attribute: VNodeProps
): VNodeProps & {
  inheritRef?: VNodeRef;
} => {
  const inheritAttrs = omit(
    {
      ...attribute,
      onVnodeMounted: (vNode: VNode) => {
        if (attribute.ref) {
          (attribute.ref as Ref).value = vNode.el;
        }
      },
      onVnodeUnmounted: (vNode: VNode) => {
        if (attribute.ref) {
          (attribute.ref as Ref).value = null;
        }
      },
    },
    ["ref"]
  );

  return inheritAttrs;
};
