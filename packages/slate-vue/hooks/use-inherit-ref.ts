import { omit } from "lodash-es";
import { Ref, VNode, VNodeProps, VNodeRef } from "vue";

export const useInheritRef = (
  attribute: VNodeProps
): VNodeProps & {
  inheritRef?: VNodeRef;
} => {
  const inheritAttrs = omit(attribute, ["ref"]);
  inheritAttrs.onVnodeMounted = (vNode: VNode) => {
    if (attribute.ref) {
      (attribute.ref as Ref).value = vNode.el;
    }
  };
  inheritAttrs.onVnodeUnmounted = (vNode: VNode) => {
    if (attribute.ref) {
      (attribute.ref as Ref).value = null;
    }
  };

  return inheritAttrs;
};
