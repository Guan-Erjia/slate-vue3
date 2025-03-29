import { Ref, VNode, VNodeProps } from "vue";

export const useInheritRef = (attribute: VNodeProps) => {
  attribute.onVnodeMounted = (vNode: VNode) => {
    if (attribute.ref) {
      (attribute.ref as Ref).value = vNode.el;
    }
  };
  attribute.onVnodeUnmounted = () => {
    if (attribute.ref) {
      (attribute.ref as Ref).value = null;
    }
  };

  return attribute;
};
