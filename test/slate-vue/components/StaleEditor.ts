import {
  Editable,
  Slate,
  SLATE_USE_ELEMENT,
  useEditor,
  useSelected,
} from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";
import { defineComponent, h, provide, ref } from "vue";
import { Element } from "slate-vue3/core";

const SelectedProbe = defineComponent({
  props: {
    captureSelected: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    props.captureSelected(useSelected({ suppressThrow: true }).value);
    return () => null;
  },
});

const StaleConsumer = defineComponent({
  props: {
    captureSelected: {
      type: Function,
      required: true,
    },
  },
  setup(props: { captureSelected: (selected: boolean) => void }) {
    const editor = useEditor();
    const elementRef = ref<Element>();

    if (!elementRef.value) {
      const { children } = editor;
      elementRef.value = children[children.length - 1] as Element;
    }

    provide(SLATE_USE_ELEMENT, elementRef);

    return () => h(SelectedProbe, { captureSelected: props.captureSelected });
  },
});

export const StaleEditor = defineComponent({
  props: {
    captureSelected: {
      type: Function,
      required: true,
    },
  },
  setup(props: {
    editor: DOMEditor;
    captureSelected: (selected: boolean) => void;
  }) {
    return () =>
      h(Slate, { editor: props.editor }, () => [
        h(Editable),
        h(StaleConsumer, { captureSelected: props.captureSelected }),
      ]);
  },
});
