import { ComponentPublicInstance, VNode, VNodeProps } from "vue";

export const useInheritRef = (attribute: VNodeProps) => {
  const setRef = (vNode: VNode) => {
    const ref = attribute.ref;
    if (ref) {
      if (typeof ref === "function") {
        ref(vNode.el as Element | ComponentPublicInstance | null, {});
      } else if (typeof ref === "object" && "value" in ref) {
        ref.value = vNode.el;
      }
    }
  };

  attribute.onVnodeMounted = setRef;
  // Slate replaces node objects when their descendants change, so the element
  // maps must be refreshed on updates as well as on mount.
  attribute.onVnodeUpdated = setRef;
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
