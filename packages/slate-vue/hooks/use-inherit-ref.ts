import { VNode, VNodeProps } from "vue";

export const useInheritRef = (attribute: VNodeProps) => {
  attribute.onVnodeMounted = (vNode: VNode) => {
    if (attribute.ref && typeof attribute.ref === "object") {
      attribute.ref.value = vNode.el;
    }
  };
  attribute.onVnodeUnmounted = () => {
    if (attribute.ref && typeof attribute.ref === "object") {
      attribute.ref.value = null;
    }
  };

  return attribute;
};
