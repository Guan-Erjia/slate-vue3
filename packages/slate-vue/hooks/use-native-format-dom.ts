import { Editor } from "slate";
import { DOMEditor, isDOMElement } from "slate-vue3/dom";
import { onMounted, onUnmounted } from "vue";

const revertMutation = (mutation: MutationRecord) => {
  const { target } = mutation;

  if (mutation.type === "characterData") {
    target.nodeValue = mutation.oldValue;
  } else if (mutation.type === "attributes" && isDOMElement(target)) {
    const name = mutation.attributeName!;
    if (mutation.oldValue === null) {
      target.removeAttribute(name);
    } else {
      target.setAttribute(name, mutation.oldValue);
    }
  } else {
    mutation.addedNodes.forEach((node) => node.parentNode?.removeChild(node));
    mutation.removedNodes.forEach((node) =>
      target.insertBefore(node, mutation.nextSibling),
    );
  }
};

export const useNativeFormatDOM = (editor: Editor) => {
  let delivered: MutationRecord[] = [];
  let observer: MutationObserver | null = null;

  const deliver = (mutations: MutationRecord[]) => {
    if (delivered.length === 0) {
      setTimeout(() => {
        delivered = [];
      });
    }
    delivered.push(...mutations);
  };

  const observe = () => {
    observer ??= new MutationObserver(deliver);
    observer.observe(DOMEditor.toDOMNode(editor, editor), {
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      subtree: true,
    });
  };

  const disconnect = () => {
    observer?.disconnect();
    delivered = [];
  };

  const revert = () => {
    const mutations = [...delivered, ...(observer?.takeRecords() ?? [])];
    delivered = [];
    mutations.reverse().forEach(revertMutation);
  };

  onMounted(() => {
    observe();
  });

  onUnmounted(() => {
    disconnect();
  });

  return { observe, disconnect, revert };
};
