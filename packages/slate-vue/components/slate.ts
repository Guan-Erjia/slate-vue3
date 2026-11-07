import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  PropType,
  provide,
  ref,
  renderSlot,
  VNode,
  watch,
} from "vue";
import {
  SLATE_USE_COMPOSING,
  SLATE_USE_FOCUSED,
  SLATE_USE_READ_ONLY,
  SLATE_USE_SELECTION,
  SLATE_USE_EDITOR,
} from "../utils/constants";
import {
  DecoratedRange,
  Descendant,
  Editor,
  Node,
  NodeEntry,
  Operation,
  Scrubber,
  Transforms,
} from "slate";
import type {
  RenderChunkProps,
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
  RenderTextProps,
} from "../utils/interface";
import {
  copyNodeInUse,
  DOMEditor,
  EDITOR_TO_ON_CHANGE,
  EDITOR_TO_PENDING_ACTION,
  EDITOR_TO_PENDING_DIFFS,
  IS_COMPOSING,
} from "slate-vue3/dom";
import { EDITOR_TO_COMPOSING } from "../hooks/use-composing";
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
import {
  SLATE_INNER_SELECTOR_CONTEXT,
  useSelectorContext,
} from "../hooks/use-slate-selector";

export const Slate = defineComponent({
  name: "slate-editor",
  emits: ["change", "selectionchange", "valuechange"],
  inheritAttrs: false,
  props: {
    editor: {
      type: Object,
      required: true,
    },
    initialValue: {
      type: Array as PropType<Descendant[]>,
      default: undefined,
    },
    value: {
      type: Array as PropType<Descendant[]>,
      default: undefined,
    },
    onValueChange: {
      type: Function as PropType<(value: Descendant[]) => void>,
      default: undefined,
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
      editor: Editor;
      initialValue?: Descendant[];
      value?: Descendant[];
      onValueChange?: (value: Descendant[]) => void;
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
      initialValue,
      value: controlledValue,
      decorate,
      renderElement,
      renderLeaf,
      renderPlaceholder,
      renderText,
      renderChunk,
    } = props;

    if (controlledValue !== undefined && initialValue !== undefined) {
      throw new Error(
        "[Slate] value and initialValue cannot be used together.",
      );
    }

    if (controlledValue !== undefined && !Node.isNodeList(controlledValue)) {
      throw new Error(
        `[Slate] value is invalid! Expected a list of elements but got: ${Scrubber.stringify(
          controlledValue,
        )}`,
      );
    }

    if (!Node.isNodeList(editor.children)) {
      throw new Error(
        `[Slate] initialValue is invalid! Expected a list of elements but got: ${Scrubber.stringify(
          editor.children,
        )}`,
      );
    }

    let initializedEditor: Editor | null = null;
    let lastEmittedValue: Descendant[] | undefined;
    let lastAppliedValue: Descendant[] | undefined;
    let appliedChildren: Descendant[] | undefined;

    const initializeEditor = () => {
      if (initializedEditor === editor) {
        return;
      }

      if (!Editor.isEditor(editor)) {
        throw new Error(
          `[Slate] editor is invalid! You passed: ${Scrubber.stringify(editor)}`,
        );
      }

      const nextValue = initialValue ?? controlledValue ?? editor.children;

      if (!Node.isNodeList(nextValue)) {
        throw new Error(
          `[Slate] initialValue is invalid! Expected a list of elements but got: ${Scrubber.stringify(
            nextValue,
          )}`,
        );
      }

      const copied =
        initialValue === undefined && controlledValue === undefined
          ? nextValue
          : nextValue.map(copyNodeInUse);
      const children = copied.every((node, i) => node === nextValue[i])
        ? nextValue
        : copied;

      editor.children = children;
      initializedEditor = editor;
      lastEmittedValue = undefined;
      lastAppliedValue = controlledValue;
    };

    initializeEditor();

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

    // 只用作上下文分享，在editable组件中修改 value
    provide(SLATE_USE_COMPOSING, ref(false));
    provide(SLATE_USE_READ_ONLY, ref(false));
    provide(SLATE_USE_SELECTION, selection);

    const focusCb = () => (isFocus.value = DOMEditor.isFocused(editor));

    // 记数用，触发 changeEffect
    const editorVersion = ref(0);
    provideEditorVersion(editorVersion);

    const { selectorContext, onChange: handleSelectorChange } =
      useSelectorContext();

    provide(SLATE_INNER_SELECTOR_CONTEXT, selectorContext);

    const onContextChange = (options?: { operation?: Operation }) => {
      const changed = editor.operations.some(
        (op) => op.type !== "set_selection",
      );
      const external = changed && editor.children === appliedChildren;
      appliedChildren = undefined;

      if (changed && !external) {
        lastEmittedValue = editor.children;
      }

      editorVersion.value++;

      emit("change", options);

      if (editor.operations.some((op) => op.type === "set_selection")) {
        emit("selectionchange", options);
      }

      if (changed && !external) {
        emit("valuechange", options);
        props.onValueChange?.(editor.children);
      }

      handleSelectorChange();
    };

    let frame: number | undefined;

    const applyControlledValue = () => {
      const value = props.value;

      if (value === undefined) {
        return;
      }

      if (value === lastEmittedValue) {
        lastAppliedValue = value;
        return;
      }

      if (value === lastAppliedValue) {
        return;
      }

      if (
        IS_COMPOSING.get(editor) ||
        EDITOR_TO_COMPOSING.get(editor) ||
        EDITOR_TO_PENDING_ACTION.get(editor) ||
        EDITOR_TO_PENDING_DIFFS.get(editor)?.length
      ) {
        frame = requestAnimationFrame(applyControlledValue);
        return;
      }

      const previous = editor.children;
      lastAppliedValue = value;
      Transforms.setChildren(editor, value);

      if (previous !== editor.children) {
        appliedChildren = editor.children;
        handleSelectorChange();
      }
    };

    watch(() => props.value, applyControlledValue, { flush: "post" });

    onMounted(() => {
      document.addEventListener("focusin", focusCb);
      document.addEventListener("focusout", focusCb);
      EDITOR_TO_ON_CHANGE.set(editor, onContextChange);
    });

    onUnmounted(() => {
      document.removeEventListener("focusin", focusCb);
      document.removeEventListener("focusout", focusCb);
      if (frame !== undefined) {
        cancelAnimationFrame(frame);
      }
      if (EDITOR_TO_ON_CHANGE.get(editor) === onContextChange) {
        EDITOR_TO_ON_CHANGE.delete(editor);
      }
    });

    return () => renderSlot(slots, "default");
  },
});
