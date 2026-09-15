import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  provide,
  ref,
  renderSlot,
  VNode,
} from "vue";
import {
  SLATE_USE_COMPOSING,
  SLATE_USE_FOCUSED,
  SLATE_USE_READ_ONLY,
  SLATE_USE_SELECTION,
  SLATE_USE_EDITOR,
} from "../utils/constants";
import { DecoratedRange, Node, NodeEntry, Operation, Scrubber } from "slate";
import type {
  RenderChunkProps,
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
  RenderTextProps,
} from "../utils/interface";
import { DOMEditor, EDITOR_TO_ON_CHANGE } from "slate-vue3/dom";
import {
  DEFAULT_CHUNK_RENDER,
  DEFAULT_DECORATE_FN,
  DEFAULT_ELEMENT_RENDER,
  DEFAULT_LEAF_RENDER,
  DEFAULT_PLACEHOLDER_RENDER,
  DEFAULT_TEXT_RENDER,
} from "./utils";
import { provideDecorateFn } from "../render/decorate";
import {
  provideRenderElement,
  provideRenderLeaf,
  provideRenderText,
} from "../render/fn";
import { provideEditorVersion } from "../render/version";
import { provideRenderPlaceholder } from "../render/placeholder";
import { provideRenderChunk } from "../render/chunk";

export const Slate = defineComponent({
  name: "slate-editor",
  emits: ["change", "selectionchange", "valuechange"],
  props: {
    editor: {
      type: Object,
      require: true,
    },
    decorate: {
      type: Function,
      default: DEFAULT_DECORATE_FN,
    },
    renderElement: {
      type: Function,
      default: DEFAULT_ELEMENT_RENDER,
    },
    renderLeaf: {
      type: Function,
      default: DEFAULT_LEAF_RENDER,
    },
    renderText: {
      type: Function,
      default: DEFAULT_TEXT_RENDER,
    },
    renderChunk: {
      type: Function,
      default: DEFAULT_CHUNK_RENDER,
    },
    renderPlaceholder: {
      type: Function,
      default: DEFAULT_PLACEHOLDER_RENDER,
    },
  },
  setup(
    props: {
      editor: DOMEditor;
      decorate: (entry: NodeEntry) => DecoratedRange[];
      renderElement: (props: RenderElementProps) => VNode;
      renderLeaf: (props: RenderLeafProps) => VNode;
      renderText: (props: RenderTextProps) => VNode;
      renderChunk: (props: RenderChunkProps) => VNode;
      renderPlaceholder: (props: RenderPlaceholderProps) => VNode;
    },
    { slots, emit },
  ) {
    const {
      editor,
      decorate,
      renderElement,
      renderLeaf,
      renderPlaceholder,
      renderText,
      renderChunk,
    } = props;
    if (!Node.isNodeList(editor.children)) {
      throw new Error(
        `[Slate] initialValue is invalid! Expected a list of elements but got: ${Scrubber.stringify(
          editor.children,
        )}`,
      );
    }
    provide(SLATE_USE_EDITOR, editor);
    provideDecorateFn(decorate);
    provideRenderElement(renderElement);
    provideRenderLeaf(renderLeaf);
    provideRenderText(renderText);
    provideRenderPlaceholder(renderPlaceholder);
    provideRenderChunk(renderChunk);

    const isFocus = ref(DOMEditor.isFocused(editor));
    const selection = computed(() => editor.selection);
    provide(SLATE_USE_FOCUSED, isFocus);

    // 只用作上下文分享，在editable.tsx组件中修改 value
    provide(SLATE_USE_COMPOSING, ref(false));
    provide(SLATE_USE_READ_ONLY, ref(false));
    provide(SLATE_USE_SELECTION, selection);

    const focusCb = () => (isFocus.value = DOMEditor.isFocused(editor));

    // 记数用，触发 changeEffect
    const editorVersion = ref(0);
    provideEditorVersion(editorVersion);

    onMounted(() => {
      document.addEventListener("focusin", focusCb);
      document.addEventListener("focusout", focusCb);
      EDITOR_TO_ON_CHANGE.set(editor, (options?: { operation?: Operation }) => {
        editorVersion.value++;
        emit("change", options);
        if (editor.operations.some((op) => op.type === "set_selection")) {
          emit("selectionchange", options);
        }
        if (editor.operations.some((op) => op.type !== "set_selection")) {
          emit("valuechange", options);
        }
      });
    });
    onUnmounted(() => {
      document.removeEventListener("focusin", focusCb);
      document.removeEventListener("focusout", focusCb);
      EDITOR_TO_ON_CHANGE.delete(editor);
    });

    return () => renderSlot(slots, "default");
  },
});
