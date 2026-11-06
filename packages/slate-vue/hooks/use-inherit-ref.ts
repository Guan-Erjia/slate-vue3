import { ComponentPublicInstance, VNode, VNodeProps } from "vue";

export const useInheritRef = (attribute: VNodeProps) => {
  attribute.onVnodeMounted = (vNode: VNode) => {
    const ref = attribute.ref;
    if (ref) {
      if (typeof ref === "function") {
        ref(vNode.el as Element | ComponentPublicInstance | null, {});
      } else if (typeof ref === "object" && "value" in ref) {
        ref.value = vNode.el;
      }
    }
  };
  attribute.onVnodeUnmounted = () => {
    const ref = attribute.ref;
    if (ref) {
      if (typeof ref === "function") {
        ref(null, {});
      } else if (typeof ref === "object" && "value" in ref) {
        ref.value = null;
      }
    }
  };

  return attribute;
};
