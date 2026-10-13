import { direction } from "direction";
import {
  BaseSelection,
  Editor,
  Node,
  Path,
  Point,
  Range,
  Text,
  Transforms,
} from "slate";
import {
  DOMEditor,
  getActiveElement,
  getDefaultView,
  getSelection,
  isDOMElement,
  isDOMNode,
  isPlainTextOnlyPaste,
  CAN_USE_DOM,
  HAS_BEFORE_INPUT_SUPPORT,
  IS_ANDROID,
  IS_CHROME,
  IS_FIREFOX,
  IS_FIREFOX_LEGACY,
  IS_IOS,
  IS_WEBKIT,
  IS_UC_MOBILE,
  IS_WECHATBROWSER,
  Hotkeys,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_USER_MARKS,
  EDITOR_TO_USER_SELECTION,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  IS_COMPOSING,
  IS_FOCUSED,
  IS_READ_ONLY,
  NODE_TO_ELEMENT,
  containsShadowAware,
  MARK_PLACEHOLDER_SYMBOL,
  PLACEHOLDER_SYMBOL,
  EDITOR_TO_FORCE_RENDER,
  IS_NODE_MAP_DIRTY,
  EDITOR_TO_PENDING_INSERTION_MARKS,
  TRIPLE_CLICK,
} from "slate-vue3/dom";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
  toRaw,
  useAttrs,
  watch,
  normalizeStyle,
} from "vue";
import type { CSSProperties, HTMLAttributes } from "vue";
import { ChildrenComp } from "./children";
import {
  DEFAULT_SCROLL_INTO_VIEW,
  handleNativeHistoryEvents,
  isDOMEventHandled,
  isDOMEventTargetInput,
  isEventHandled,
} from "./utils";
import { useEditor } from "../hooks/use-editor";
import { useComposing } from "../hooks/use-composing";
import { useReadOnly } from "../hooks/use-read-only";
import { useEditorVersion } from "../render/version";
import { injectDecorateFn } from "../render/decorate";
import { RestoreDOM } from "./restore-dom/restore-dom";
import { useTrackUserInput } from "../hooks/use-track-user-input";
import { useAndroidInputManager } from "../hooks/android-input-manager/use-android-input-manager";
import { debounce, throttle } from "lodash-es";
import { deleteMovedRange, getMovableRange } from "../utils/move-range";
import { useCompositionDOM } from "../hooks/use-composition-dom";
import { getPointAboveTrailingNewline } from "../utils/trailing-newline";
import { getCharacterMoveUnit } from "../utils/character-move";

const isSameCaretPosition = (editor: Editor, a: Range, b: Range) => {
  if (!Range.isCollapsed(a) || !Range.isCollapsed(b)) {
    return false;
  }

  const [first, second] = Path.isBefore(a.anchor.path, b.anchor.path)
    ? [a.anchor, b.anchor]
    : [b.anchor, a.anchor];

  if (second.offset !== 0 || !Path.equals(Path.next(first.path), second.path)) {
    return false;
  }

  const node = Node.get(editor, first.path);
  return Node.isText(node) && first.offset === node.text.length;
};

/**
 * The default placeholder element
 */

const isInSlateText = (node: unknown) =>
  isDOMNode(node) &&
  node.nodeType === node.TEXT_NODE &&
  !!node.parentElement?.closest("[data-slate-string], [data-slate-zero-width]");

const restoreDomSelection = (
  editor: Editor,
  domSelection: Selection,
  state: { isUpdatingSelection: boolean },
) => {
  if (!editor.selection) {
    return;
  }

  const domRange = DOMEditor.toDOMRange(editor, editor.selection);
  state.isUpdatingSelection = true;
  domSelection.setBaseAndExtent(
    domRange.startContainer,
    domRange.startOffset,
    domRange.endContainer,
    domRange.endOffset,
  );
  setTimeout(() => {
    state.isUpdatingSelection = false;
  });
};

const selectMovableRange = (editor: Editor) => {
  const { selection } = editor;

  if (selection && Range.isExpanded(selection)) {
    const movableRange = getMovableRange(editor, selection);

    if (!Range.equals(movableRange, selection)) {
      Transforms.select(editor, movableRange);
    }
  }
};

export const Editable = defineComponent({
  name: "slate-editable",
  props: {
    scrollSelectionIntoView: {
      type: Function,
      default: DEFAULT_SCROLL_INTO_VIEW,
    },
    placeholder: {
      type: String,
      default: () => "",
    },
    readOnly: {
      type: Boolean,
      default: () => false,
    },
    autoFocus: {
      type: Boolean,
      default: () => false,
    },
  },
  setup(props: {
    readOnly: boolean;
    placeholder: string;
    scrollSelectionIntoView: (
      editor: DOMEditor,
      domRange: globalThis.Range,
    ) => void;
    autoFocus: boolean;
  }) {
    const { placeholder, readOnly, scrollSelectionIntoView, autoFocus } = props;

    const editor = useEditor();
    const attributes: HTMLAttributes = useAttrs();
    const refrestoreDOMContainer = ref<HTMLDivElement | null>(null);
    const isComposing = useComposing();

    const isReadOnly = useReadOnly();
    watch(
      () => readOnly,
      (current) => {
        IS_READ_ONLY.set(editor, current);
        isReadOnly.value = current;
      },
    );

    // Keep track of some state for the event handler logic.
    const state: {
      isDraggingInternally: boolean;
      latestElement: globalThis.Element | null;
      hasMarkPlaceholder: boolean;
      pendingSelection: {
        range: Range;
        basedOn: Range | null;
      } | null;
      isUpdatingSelection: boolean;
    } = {
      isDraggingInternally: false,
      latestElement: null,
      hasMarkPlaceholder: false,
      pendingSelection: null,
      isUpdatingSelection: false,
    };

    const placeholderHeight = ref<number>();
    const onPlaceholderResize = (h?: number) => (placeholderHeight.value = h);

    // webkit 内核使用，在影子节点渲染是获取 selection
    const processing = ref(false);

    const compositionDOM = useCompositionDOM(editor);
    const deleteOnCompositionEndRef = ref(false);

    const { onUserInput, receivedUserInput } = useTrackUserInput();
    const proxy = getCurrentInstance();
    EDITOR_TO_FORCE_RENDER.set(editor, () => proxy?.update());

    const onDOMSelectionChange = throttle(() => {
      if (IS_NODE_MAP_DIRTY.get(editor)) {
        onDOMSelectionChange();
        return;
      }
      state.pendingSelection = null;

      const el = DOMEditor.toDOMNode(editor, editor);
      const root = el.getRootNode();

      if (!processing.value && IS_WEBKIT && root instanceof ShadowRoot) {
        processing.value = true;
        const active = getActiveElement();

        if (active) {
          document.execCommand("indent");
        } else {
          Transforms.deselect(editor);
        }

        processing.value = false;
        return;
      }

      if (
        (IS_ANDROID || !DOMEditor.isComposing(editor)) &&
        (!state.isUpdatingSelection || androidManager?.isFlushing()) &&
        !state.isDraggingInternally
      ) {
        const root = DOMEditor.findDocumentOrShadowRoot(editor);
        const { activeElement } = root;
        const el = DOMEditor.toDOMNode(editor, editor);
        const domSelection = getSelection(root);

        if (activeElement === el) {
          state.latestElement = activeElement;
          IS_FOCUSED.set(editor, true);
        } else {
          IS_FOCUSED.delete(editor);
        }

        if (!domSelection) {
          return Transforms.deselect(editor);
        }

        const { anchorNode, focusNode } = domSelection;

        const anchorNodeSelectable =
          DOMEditor.hasEditableTarget(editor, anchorNode) ||
          DOMEditor.isTargetInsideNonReadonlyVoid(editor, anchorNode);

        const focusNodeInEditor = DOMEditor.hasTarget(editor, focusNode);
        const isFocusInEditor =
          isDOMNode(activeElement) && el.contains(activeElement);

        if (
          anchorNodeSelectable &&
          focusNodeInEditor &&
          (readOnly || isFocusInEditor)
        ) {
          const range = DOMEditor.toSlateRange(editor, domSelection, {
            exactMatch: false,
            suppressThrow: true,
          });

          if (range) {
            if (
              !DOMEditor.isComposing(editor) &&
              !androidManager?.hasPendingChanges() &&
              !androidManager?.isFlushing()
            ) {
              const isCaretOutsideText =
                domSelection.isCollapsed && !isInSlateText(anchorNode);

              if (
                isCaretOutsideText &&
                editor.selection &&
                Range.equals(range, editor.selection)
              ) {
                restoreDomSelection(editor, domSelection, state);
              } else {
                Transforms.select(editor, range);
              }
            } else {
              androidManager?.handleUserSelect(range);
            }
          }
        }

        // Deselect the editor if the dom selection is not selectable in readonly mode
        if (readOnly && (!anchorNodeSelectable || !focusNodeInEditor)) {
          Transforms.deselect(editor);
        }
      }
    }, 100);

    const scheduleOnDOMSelectionChange = debounce(onDOMSelectionChange, 0);

    const flushDOMSelectionChange = () => {
      const root = DOMEditor.toDOMNode(editor, editor).getRootNode();
      scheduleOnDOMSelectionChange.flush();
      if (!(IS_WEBKIT && root instanceof ShadowRoot)) {
        onDOMSelectionChange();
      }
      onDOMSelectionChange.flush();
    };

    const editableRef = ref<HTMLElement>();
    const androidManager = useAndroidInputManager({
      node: editableRef,
      onDOMSelectionChange,
      scheduleOnDOMSelectionChange,
    });

    onMounted(() => {
      // Update element-related weak maps with the DOM element ref.
      let window;
      if (editableRef.value && (window = getDefaultView(editableRef.value))) {
        EDITOR_TO_WINDOW.set(editor, window);
        EDITOR_TO_ELEMENT.set(editor, editableRef.value);
        NODE_TO_ELEMENT.set(editor, editableRef.value);
        ELEMENT_TO_NODE.set(editableRef.value, editor);
      }
    });
    onUnmounted(() => {
      EDITOR_TO_ELEMENT.delete(editor);
      NODE_TO_ELEMENT.delete(editor);
    });

    const setDomSelection = (
      selection: BaseSelection,
      forceChange?: boolean,
    ) => {
      const root = DOMEditor.findDocumentOrShadowRoot(editor);
      const domSelection = getSelection(root);
      if (!domSelection) {
        return;
      }
      const hasDomSelection = domSelection.type !== "None";

      // If the DOM selection is properly unset, we're done.
      if (!selection && !hasDomSelection) {
        return;
      }

      // Get anchorNode and focusNode
      const focusNode = domSelection.focusNode;
      let anchorNode;

      // COMPAT: In firefox the normal selection way does not work
      // (https://github.com/ianstormtaylor/slate/pull/5486#issue-1820720223)
      if (IS_FIREFOX && domSelection.rangeCount > 1) {
        const firstRange = domSelection.getRangeAt(0);
        const lastRange = domSelection.getRangeAt(domSelection.rangeCount - 1);

        // Right to left
        if (firstRange.startContainer === focusNode) {
          anchorNode = lastRange.endContainer;
        } else {
          // Left to right
          anchorNode = firstRange.startContainer;
        }
      } else {
        anchorNode = domSelection.anchorNode;
      }
      // verify that the dom selection is in the editor
      const editorElement = EDITOR_TO_ELEMENT.get(editor)!;
      let hasDomSelectionInEditor = false;
      if (
        containsShadowAware(editorElement, anchorNode) &&
        containsShadowAware(editorElement, focusNode)
      ) {
        hasDomSelectionInEditor = true;
      }

      // If the DOM selection is in the editor and the editor selection is already correct, we're done.
      if (
        hasDomSelection &&
        hasDomSelectionInEditor &&
        selection &&
        !forceChange
      ) {
        const slateRange = DOMEditor.toSlateRange(editor, domSelection, {
          exactMatch: true,

          // domSelection is not necessarily a valid Slate range
          // (e.g. when clicking on contentEditable:false element)
          suppressThrow: true,
        });

        if (
          slateRange &&
          Range.equals(slateRange, selection) &&
          (!state.hasMarkPlaceholder ||
            anchorNode?.parentElement?.hasAttribute(
              "data-slate-mark-placeholder",
            ))
        ) {
          const scrollForInput = pendingInputScroll.value;
          pendingInputScroll.value = false;
          const selectionChangedByEdit =
            scrollForInput &&
            previousChildren.value !== editor.children &&
            !!editor.selection &&
            (!previousSelection.value ||
              !Range.equals(previousSelection.value, editor.selection));
          if (selectionChangedByEdit) {
            scrollSelectionIntoView(editor, domSelection.getRangeAt(0));
          }
          return;
        }
      }

      // when <Editable/> is being controlled through external value
      // then its children might just change - DOM responds to it on its own
      // but Slate's value is not being updated through any operation
      // and thus it doesn't transform selection on its own
      if (selection && !DOMEditor.hasRange(editor, selection)) {
        editor.selection = DOMEditor.toSlateRange(editor, domSelection, {
          exactMatch: false,
          suppressThrow: true,
        });
        return;
      }

      const pending = state.pendingSelection;
      state.pendingSelection = null;

      if (
        pending &&
        !forceChange &&
        pending.basedOn === selection &&
        !(selection && Range.equals(pending.range, selection))
      ) {
        Transforms.select(editor, pending.range);
        return;
      }

      // Otherwise the DOM selection is out of sync, so update it.
      state.isUpdatingSelection = true;

      let newDomRange: globalThis.Range | null = null;

      try {
        newDomRange = selection && DOMEditor.toDOMRange(editor, selection);
      } catch (e) {
        // Ignore, dom and state might be out of sync
      }

      if (newDomRange) {
        if (DOMEditor.isComposing(editor) && !IS_ANDROID) {
          if (domSelection.rangeCount > 0) {
            domSelection.collapseToEnd();
          }
        } else if (Range.isBackward(selection!)) {
          domSelection.setBaseAndExtent(
            newDomRange.endContainer,
            newDomRange.endOffset,
            newDomRange.startContainer,
            newDomRange.startOffset,
          );
        } else {
          domSelection.setBaseAndExtent(
            newDomRange.startContainer,
            newDomRange.startOffset,
            newDomRange.endContainer,
            newDomRange.endOffset,
          );
        }
        scrollSelectionIntoView(editor, newDomRange);
      } else {
        domSelection.removeAllRanges();
      }

      return newDomRange;
    };

    const editorVersion = useEditorVersion();

    watch(
      () => editorVersion.value,
      () => {
        // Make sure the DOM selection state is in sync.
        previousChildren.value = editor.children;
        previousSelection.value = editor.selection;
        const root = DOMEditor.findDocumentOrShadowRoot(editor);
        const domSelection = getSelection(root);
        if (
          !domSelection ||
          !DOMEditor.isFocused(editor) ||
          androidManager?.hasPendingAction()
        ) {
          return;
        }
        // In firefox if there is more then 1 range and we call setDomSelection we remove the ability to select more cells in a table
        if (domSelection.rangeCount <= 1) {
          setDomSelection(editor.selection);
        }
        const ensureSelection = androidManager?.isFlushing() === "action";

        if (!IS_ANDROID || !ensureSelection) {
          setTimeout(() => {
            state.isUpdatingSelection = false;
          });
          return;
        }

        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        const animationFrameId = requestAnimationFrame(() => {
          if (ensureSelection) {
            const ensureDomSelection = (forceChange?: boolean) => {
              try {
                const el = DOMEditor.toDOMNode(editor, editor);
                el.focus();

                setDomSelection(editor.selection, forceChange);
              } catch (e) {
                // Ignore, dom and state might be out of sync
              }
            };

            // Compat: Android IMEs try to force their selection by manually re-applying it even after we set it.
            // This essentially would make setting the slate selection during an update meaningless, so we force it
            // again here. We can't only do it in the setTimeout after the animation frame since that would cause a
            // visible flicker.
            ensureDomSelection();

            timeoutId = setTimeout(() => {
              // COMPAT: While setting the selection in an animation frame visually correctly sets the selection,
              // it doesn't update GBoards spellchecker state. We have to manually trigger a selection change after
              // the animation frame to ensure it displays the correct state.
              ensureDomSelection(true);
              state.isUpdatingSelection = false;
            });
          }
        });

        return () => {
          cancelAnimationFrame(animationFrameId);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        };
      },
    );

    // Listen for dragend and drop globally. In Firefox, if a drop handler
    // initiates an operation that causes the originally dragged element to
    // unmount, that element will not emit a dragend event. (2024/06/21)
    const stoppedDragging = () => (state.isDraggingInternally = false);
    onMounted(() => {
      // Attach a native DOM event handler for `selectionchange`, because React's
      // built-in `onSelect` handler doesn't fire for all selection changes. It's
      // a leaky polyfill that only fires on keypresses or clicks. Instead, we
      // want to fire for any change to the selection inside the editor.
      // (2019/11/04) https://github.com/facebook/react/issues/5785
      const window = DOMEditor.getWindow(editor);
      window.document.addEventListener("selectionchange", onSelectionChange);
      window.document.addEventListener("dragend", stoppedDragging);
      window.document.addEventListener("drop", stoppedDragging);
      if (HAS_BEFORE_INPUT_SUPPORT && editableRef.value) {
        editableRef.value.addEventListener("beforeinput", onDOMBeforeInput);
      }
      if (autoFocus) {
        if (editor.children.length > 0) {
          DOMEditor.focus(editor);
        } else {
          editableRef.value?.focus();
        }
      }
    });
    onUnmounted(() => {
      const window = DOMEditor.getWindow(editor);
      window.document.removeEventListener("selectionchange", onSelectionChange);
      window.document.removeEventListener("dragend", stoppedDragging);
      window.document.removeEventListener("drop", stoppedDragging);
      onDOMSelectionChange.cancel();
      scheduleOnDOMSelectionChange.cancel();
      EDITOR_TO_ELEMENT.delete(editor);
      NODE_TO_ELEMENT.delete(editor);

      if (HAS_BEFORE_INPUT_SUPPORT && editableRef.value) {
        editableRef.value.removeEventListener("beforeinput", onDOMBeforeInput);
      }
    });

    // Listen on the native `beforeinput` event to get real "Level 2" events. This
    // is required because React's `beforeinput` is fake and never really attaches
    // to the real event sadly. (2019/11/01)
    // https://github.com/facebook/react/issues/11211
    const onDOMBeforeInput = (event: InputEvent) => {
      if (!DOMEditor.hasEditableTarget(editor, event.target)) {
        return;
      }

      handleNativeHistoryEvents(editor, event);
      const el = DOMEditor.toDOMNode(editor, editor);
      const root = el.getRootNode();

      if (processing?.value && IS_WEBKIT && root instanceof ShadowRoot) {
        const ranges = event.getTargetRanges();
        const range = ranges[0];

        const newRange = new globalThis.Range();

        newRange.setStart(range.startContainer, range.startOffset);
        newRange.setEnd(range.endContainer, range.endOffset);

        // Unresolvable ranges would throw out of the handler (#3556); suppress and skip the move.
        const slateRange = DOMEditor.toSlateRange(editor, newRange, {
          exactMatch: false,
          suppressThrow: true,
        });
        if (slateRange) {
          Transforms.select(editor, slateRange);
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      onUserInput();
      pendingInputScroll.value = true;

      if (!readOnly && !isDOMEventHandled(event, attributes.onBeforeinput)) {
        // COMPAT: BeforeInput events aren't cancelable on android, so we have to handle them differently using the android input manager.
        if (androidManager?.handleDOMBeforeInput) {
          return androidManager.handleDOMBeforeInput(event);
        }

        // Some IMEs/Chrome extensions like e.g. Grammarly set the selection immediately before
        // triggering a `beforeinput` expecting the change to be applied to the immediately before
        // set selection.
        flushDOMSelectionChange();

        const { selection } = editor;
        const { inputType } = event;
        const data = (event as any).dataTransfer || event.data || undefined;

        const isCompositionChange =
          inputType === "insertCompositionText" ||
          inputType === "deleteCompositionText";

        // COMPAT: use composition change events as a hint to where we should insert
        // composition text if we aren't composing to work around https://github.com/ianstormtaylor/slate/issues/5038
        if (isCompositionChange && DOMEditor.isComposing(editor)) {
          if (IS_CHROME || deleteOnCompositionEndRef.value) {
            compositionDOM.track(event.data);
          }
          return;
        }

        let native = false;
        if (
          inputType === "insertText" &&
          selection &&
          Range.isCollapsed(selection) &&
          // Only use native character insertion for single characters a-z or space for now.
          // Long-press events (hold a + press 4 = ä) to choose a special character otherwise
          // causes duplicate inserts.
          event.data &&
          event.data.length === 1 &&
          /[a-z ]/i.test(event.data) &&
          // Chrome has issues correctly editing the start of nodes: https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
          // When there is an inline element, e.g. a link, and you select
          // right after it (the start of the next node).
          selection.anchor.offset !== 0
        ) {
          native = true;
          // Skip native if there are marks, as
          // `insertText` will insert a node, not just text.
          if (editor.marks) {
            native = false;
          }

          const domAnchor = getSelection(
            DOMEditor.findDocumentOrShadowRoot(editor),
          )?.anchorNode;

          if (!isInSlateText(domAnchor)) {
            native = false;
          }

          // If the NODE_MAP is dirty, we can't trust the selection anchor (eg ReactEditor.toDOMPoint)
          if (!IS_NODE_MAP_DIRTY.get(editor)) {
            // Chrome also has issues correctly editing the end of anchor elements: https://bugs.chromium.org/p/chromium/issues/detail?id=1259100
            // Therefore we don't allow native events to insert text at the end of anchor nodes.
            const { anchor } = selection;

            const [node, offset] = DOMEditor.toDOMPoint(editor, anchor);
            const anchorNode = node.parentElement?.closest("a");

            const window = DOMEditor.getWindow(editor);

            if (
              native &&
              anchorNode &&
              DOMEditor.hasDOMNode(editor, anchorNode)
            ) {
              // Find the last text node inside the anchor.
              const lastText = window?.document
                .createTreeWalker(anchorNode, NodeFilter.SHOW_TEXT)
                .lastChild() as globalThis.Text | null;

              if (
                lastText === node &&
                lastText.textContent?.length === offset
              ) {
                native = false;
              }
            }

            // Chrome has issues with the presence of tab characters inside elements with whiteSpace = 'pre'
            // causing abnormal insert behavior: https://bugs.chromium.org/p/chromium/issues/detail?id=1219139
            if (
              native &&
              node.parentElement &&
              window?.getComputedStyle(node.parentElement)?.whiteSpace === "pre"
            ) {
              const block = Editor.above(editor, {
                at: anchor.path,
                match: (n) => Node.isElement(n) && Editor.isBlock(editor, n),
              });

              if (block && Node.string(block[0]).includes("\t")) {
                native = false;
              }
            }
          }
        }
        // COMPAT: For the deleting forward/backward input types we don't want
        // to change the selection because it is the range that will be deleted,
        // and those commands determine that for themselves.
        // If the NODE_MAP is dirty, we can't trust the selection anchor (eg ReactEditor.toDOMPoint via ReactEditor.toSlateRange)
        if (
          (!inputType.startsWith("delete") ||
            inputType.startsWith("deleteBy")) &&
          !IS_NODE_MAP_DIRTY.get(editor)
        ) {
          const [targetRange] = (event as any).getTargetRanges();

          if (targetRange) {
            // Unresolvable ranges would throw out of the handler (#3556); suppress and fall back to synthetic handling.
            const range = DOMEditor.toSlateRange(editor, targetRange, {
              exactMatch: false,
              suppressThrow: true,
            });

            if (!range) {
              native = false;
            } else if (!selection || !Range.equals(selection, range)) {
              native = false;

              const selectionRef =
                !isCompositionChange &&
                editor.selection &&
                !isSameCaretPosition(editor, editor.selection, range) &&
                Editor.rangeRef(editor, editor.selection);

              Transforms.select(editor, range);

              if (selectionRef) {
                EDITOR_TO_USER_SELECTION.set(editor, selectionRef);
              }
            }
          }
        }

        // Composition change types occur while a user is composing text and can't be
        // cancelled. Let them through and wait for the composition to end.
        if (isCompositionChange) {
          return;
        }

        if (!native) {
          event.preventDefault();
        }

        // COMPAT: If the selection is expanded, even if the command seems like
        // a delete forward/backward command it should delete the selection.
        if (
          selection &&
          Range.isExpanded(selection) &&
          inputType.startsWith("delete")
        ) {
          const direction = inputType.endsWith("Backward")
            ? "backward"
            : "forward";
          Editor.deleteFragment(editor, { direction });
          return;
        }

        switch (inputType) {
          case "deleteByComposition":
          case "deleteByCut":
          case "deleteByDrag": {
            Editor.deleteFragment(editor);
            break;
          }

          case "deleteContent":
          case "deleteContentForward": {
            Editor.deleteForward(editor);
            break;
          }

          case "deleteContentBackward": {
            Editor.deleteBackward(editor);
            break;
          }

          case "deleteEntireSoftLine": {
            Editor.deleteBackward(editor, { unit: "line" });
            Editor.deleteForward(editor, { unit: "line" });
            break;
          }

          case "deleteHardLineBackward": {
            Editor.deleteBackward(editor, { unit: "block" });
            break;
          }

          case "deleteSoftLineBackward": {
            Editor.deleteBackward(editor, { unit: "line" });
            break;
          }

          case "deleteHardLineForward": {
            Editor.deleteForward(editor, { unit: "block" });
            break;
          }

          case "deleteSoftLineForward": {
            Editor.deleteForward(editor, { unit: "line" });
            break;
          }

          case "deleteWordBackward": {
            Editor.deleteBackward(editor, { unit: "word" });
            break;
          }

          case "deleteWordForward": {
            Editor.deleteForward(editor, { unit: "word" });
            break;
          }

          case "insertLineBreak":
            Editor.insertSoftBreak(editor);
            break;

          case "insertParagraph": {
            Editor.insertBreak(editor);
            break;
          }

          case "insertFromComposition":
          case "insertFromDrop":
          case "insertFromPaste":
          case "insertFromYank":
          case "insertReplacementText":
          case "insertText": {
            if (inputType === "insertFromComposition") {
              // COMPAT: in Safari, `compositionend` is dispatched after the
              // `beforeinput` for "insertFromComposition". But if we wait for it
              // then we will abort because we're still composing and the selection
              // won't be updated properly.
              // https://www.w3.org/TR/input-events-2/
              if (DOMEditor.isComposing(editor)) {
                isComposing.value = false;
                IS_COMPOSING.set(editor, false);
              }
            }

            // use a weak comparison instead of 'instanceof' to allow
            // programmatic access of paste events coming from external windows
            // like cypress where cy.window does not work realibly
            if (data?.constructor.name === "DataTransfer") {
              DOMEditor.insertData(editor, data);
            } else if (typeof data === "string") {
              // Only insertText operations use the native functionality, for now.
              // Potentially expand to single character deletes, as well.
              if (native) {
                deferredOperations.value.push(() =>
                  Editor.insertText(editor, data),
                );
              } else {
                Editor.insertText(editor, data);
              }
            }

            break;
          }
        }

        // Restore the actual user section if nothing manually set it.
        const toRestore = EDITOR_TO_USER_SELECTION.get(editor)?.unref();
        EDITOR_TO_USER_SELECTION.delete(editor);

        if (
          toRestore &&
          (!editor.selection || !Range.equals(editor.selection, toRestore))
        ) {
          Transforms.select(editor, toRestore);
        }
      }
    };

    // COMPAT: In Chrome, `selectionchange` events can fire when <input> and
    // <textarea> elements are appended to the DOM, causing
    // `editor.selection` to be overwritten in some circumstances.
    // (2025/01/16) https://issues.chromium.org/issues/389368412
    const readUnsyncedSelection = () => {
      if (
        state.isUpdatingSelection ||
        state.isDraggingInternally ||
        DOMEditor.isComposing(editor) ||
        androidManager?.hasPendingChanges() ||
        androidManager?.isFlushing() ||
        IS_NODE_MAP_DIRTY.get(editor)
      ) {
        return null;
      }

      const domSelection = getSelection(
        DOMEditor.findDocumentOrShadowRoot(editor),
      );

      if (
        !domSelection ||
        !(
          DOMEditor.hasEditableTarget(editor, domSelection.anchorNode) ||
          DOMEditor.isTargetInsideNonReadonlyVoid(
            editor,
            domSelection.anchorNode,
          )
        ) ||
        !DOMEditor.hasTarget(editor, domSelection.focusNode)
      ) {
        return null;
      }

      const range = DOMEditor.toSlateRange(editor, domSelection, {
        exactMatch: false,
        suppressThrow: true,
      });

      return range ? { range, basedOn: editor.selection } : null;
    };

    const onSelectionChange = ({ target }: Event) => {
      const targetElement = target instanceof HTMLElement ? target : null;
      const targetTagName = targetElement?.tagName;
      if (targetTagName === "INPUT" || targetTagName === "TEXTAREA") {
        return;
      }
      state.pendingSelection = readUnsyncedSelection();
      scheduleOnDOMSelectionChange();
    };

    const previousChildren = ref(editor.children);
    const previousSelection = ref(editor.selection);
    const pendingInputScroll = ref(false);
    const deferredOperations = ref<Array<() => void>>([]);
    const onBeforeinput = (event: InputEvent) => {
      // COMPAT: Certain browsers don't support the `beforeinput` event, so we
      // fall back to React's leaky polyfill instead just for it. It
      // only works for the `insertText` input type.
      if (
        !HAS_BEFORE_INPUT_SUPPORT &&
        !readOnly &&
        !isEventHandled(event, attributes.onBeforeinput) &&
        DOMEditor.hasSelectableTarget(editor, event.target)
      ) {
        event.preventDefault();
        if (!DOMEditor.isComposing(editor)) {
          const text = (event as any).data as string;
          Editor.insertText(editor, text);
        }
      }
    };

    const onInput = (event: InputEvent) => {
      if (!DOMEditor.hasEditableTarget(editor, event.target)) {
        return;
      }

      compositionDOM.pause();
      if (isEventHandled(event, attributes.onInput)) {
        return;
      }
      if (androidManager) {
        androidManager.handleInput();
        return;
      }

      // Flush native operations, as native events will have propogated
      // and we can correctly compare DOM text values in components
      // to stop rendering, so that browser functions like autocorrect
      // and spellcheck work as expected.
      for (const op of deferredOperations.value) {
        op();
      }
      deferredOperations.value = [];

      // COMPAT: Since `beforeinput` doesn't fully `preventDefault`,
      // there's a chance that content might be placed in the browser's undo stack.
      // This means undo can be triggered even when the div is not focused,
      // and it only triggers the input event for the node. (2024/10/09)
      if (!DOMEditor.isFocused(editor)) {
        handleNativeHistoryEvents(editor, event);
      }
    };

    const onBlur = (event: FocusEvent) => {
      if (
        readOnly ||
        state.isUpdatingSelection ||
        !DOMEditor.hasSelectableTarget(editor, event.target) ||
        isEventHandled(event, attributes.onBlur)
      ) {
        return;
      }

      // COMPAT: If the current `activeElement` is still the previous
      // one, this is due to the window being blurred when the tab
      // itself becomes unfocused, so we want to abort early to allow to
      // editor to stay focused when the tab becomes focused again.
      const root = DOMEditor.findDocumentOrShadowRoot(editor);
      if (state.latestElement === root.activeElement) {
        return;
      }

      const { relatedTarget } = event;
      const el = DOMEditor.toDOMNode(editor, editor);

      // COMPAT: The event should be ignored if the focus is returning
      // to the editor from an embedded editable element (eg. an <input>
      // element inside a void node).
      if (relatedTarget === el) {
        return;
      }

      // COMPAT: The event should be ignored if the focus is moving from
      // the editor to inside a void node's spacer element.
      if (
        isDOMElement(relatedTarget) &&
        relatedTarget.hasAttribute("data-slate-spacer")
      ) {
        return;
      }

      // COMPAT: The event should be ignored if the focus is moving to a
      // non- editable section of an element that isn't a void node (eg.
      // a list item of the check list example).
      if (
        relatedTarget != null &&
        isDOMNode(relatedTarget) &&
        DOMEditor.hasDOMNode(editor, relatedTarget)
      ) {
        const node = DOMEditor.toSlateNode(editor, relatedTarget);

        if (Node.isElement(node) && !editor.isVoid(node)) {
          return;
        }
      }

      // COMPAT: Safari doesn't always remove the selection even if the content-
      // editable element no longer has focus. Refer to:
      // https://stackoverflow.com/questions/12353247/force-contenteditable-div-to-stop-accepting-input-after-it-loses-focus-under-web
      if (IS_WEBKIT) {
        const domSelection = getSelection(root);
        domSelection?.removeAllRanges();
      }

      IS_FOCUSED.delete(editor);
    };

    const onClick = (event: PointerEvent) => {
      if (DOMEditor.hasTarget(editor, event.target)) {
        flushDOMSelectionChange();
      }
      if (
        DOMEditor.hasTarget(editor, event.target) &&
        !isEventHandled(event, attributes.onClick) &&
        isDOMNode(event.target)
      ) {
        const node = DOMEditor.toSlateNode(editor, event.target);
        const path = DOMEditor.findPath(editor, node);

        // At this time, the Slate document may be arbitrarily different,
        // because onClick handlers can change the document before we get here.
        // Therefore we must check that this path actually exists,
        // and that it still refers to the same node.
        if (
          !Editor.hasPath(editor, path) ||
          toRaw(Node.get(editor, path)) !== node
        ) {
          return;
        }

        if (event.detail === TRIPLE_CLICK && path.length >= 1) {
          let blockPath = path;
          if (!(Node.isElement(node) && Editor.isBlock(editor, node))) {
            const block = Editor.above(editor, {
              match: (n) => Node.isElement(n) && Editor.isBlock(editor, n),
              at: path,
            });

            blockPath = block?.[1] ?? path.slice(0, 1);
          }

          const range = Editor.range(editor, blockPath);
          Transforms.select(editor, range);
          return;
        }

        if (readOnly) {
          return;
        }

        const start = Editor.start(editor, path);
        const end = Editor.end(editor, path);
        const startVoid = Editor.void(editor, { at: start });
        const endVoid = Editor.void(editor, { at: end });
        const selectedVoid =
          editor.selection &&
          Range.isCollapsed(editor.selection) &&
          Editor.void(editor, { at: editor.selection.anchor });

        if (
          event.shiftKey &&
          selectedVoid &&
          !Path.isAncestor(selectedVoid[1], path) &&
          !(startVoid && Path.equals(startVoid[1], selectedVoid[1]))
        ) {
          const clicked = DOMEditor.findEventRange(editor, event);
          const voidStart = Editor.start(editor, selectedVoid[1]);
          const voidEnd = Editor.end(editor, selectedVoid[1]);
          const anchor = Point.isBefore(clicked.anchor, voidStart)
            ? voidEnd
            : voidStart;
          Transforms.select(editor, {
            anchor,
            focus: clicked.anchor,
          });
          return;
        }

        if (startVoid && endVoid && Path.equals(startVoid[1], endVoid[1])) {
          if (event.shiftKey && editor.selection) {
            const { anchor } = editor.selection;
            const focus = Point.isBefore(anchor, start) ? end : start;
            Transforms.select(editor, { anchor, focus });
            return;
          }

          const range = Editor.range(editor, start);
          Transforms.select(editor, range);
        }
      }
    };

    const onCompositionend = (event: CompositionEvent) => {
      if (isDOMEventTargetInput(event)) {
        return;
      }
      if (DOMEditor.hasSelectableTarget(editor, event.target)) {
        if (DOMEditor.isComposing(editor)) {
          Promise.resolve().then(() => {
            isComposing.value = false;
            IS_COMPOSING.set(editor, false);
          });
        }

        androidManager?.handleCompositionEnd(event);

        const deleteOnCompositionEnd = deleteOnCompositionEndRef.value;
        deleteOnCompositionEndRef.value = false;

        if (isEventHandled(event, attributes.onCompositionend) || IS_ANDROID) {
          compositionDOM.clear();
          return;
        }

        if (deleteOnCompositionEnd && !event.data) {
          compositionDOM.restore();
          Editor.deleteFragment(editor);
        }

        // COMPAT: In Chrome, `beforeinput` events for compositions
        // aren't correct and never fire the "insertFromComposition"
        // type that we need. So instead, insert whenever a composition
        // ends since it will already have been committed to the DOM.
        if (
          !IS_WEBKIT &&
          !IS_FIREFOX_LEGACY &&
          !IS_IOS &&
          !IS_WECHATBROWSER &&
          !IS_UC_MOBILE &&
          event.data
        ) {
          const placeholderMarks =
            EDITOR_TO_PENDING_INSERTION_MARKS.get(editor);
          EDITOR_TO_PENDING_INSERTION_MARKS.delete(editor);

          // Ensure we insert text with the marks the user was actually seeing
          if (placeholderMarks !== undefined) {
            EDITOR_TO_USER_MARKS.set(editor, editor.marks);
            editor.marks = placeholderMarks;
          }

          compositionDOM.restore();
          Editor.insertText(editor, event.data);

          const userMarks = EDITOR_TO_USER_MARKS.get(editor);
          EDITOR_TO_USER_MARKS.delete(editor);
          if (userMarks !== undefined) {
            editor.marks = userMarks;
          }
        }
        compositionDOM.clear();
      }
    };

    const onCompositionupdate = (event: CompositionEvent) => {
      if (
        DOMEditor.hasSelectableTarget(editor, event.target) &&
        !isEventHandled(event, attributes.onCompositionupdate) &&
        !isDOMEventTargetInput(event)
      ) {
        if (!DOMEditor.isComposing(editor)) {
          isComposing.value = true;
          IS_COMPOSING.set(editor, true);
        }
      }
    };

    const onCompositionstart = (event: CompositionEvent) => {
      if (isDOMEventTargetInput(event)) {
        return;
      }
      if (DOMEditor.hasSelectableTarget(editor, event.target)) {
        androidManager?.handleCompositionStart(event);

        if (
          isEventHandled(event, attributes.onCompositionstart) ||
          IS_ANDROID
        ) {
          return;
        }

        compositionDOM.clear();
        isComposing.value = true;
        flushDOMSelectionChange();

        const { selection } = editor;
        if (selection && Range.isExpanded(selection)) {
          if (IS_FIREFOX && !IS_FIREFOX_LEGACY) {
            compositionDOM.observe();
            deleteOnCompositionEndRef.value = true;
            return;
          }
          Editor.deleteFragment(editor);
          return;
        }
      }
    };

    const onCopy = (event: ClipboardEvent) => {
      if (
        DOMEditor.hasSelectableTarget(editor, event.target) &&
        !isEventHandled(event, attributes.onCopy) &&
        !isDOMEventTargetInput(event)
      ) {
        event.preventDefault();
        if (event.clipboardData) {
          DOMEditor.setFragmentData(editor, event.clipboardData, "copy");
        }
      }
    };

    const onCut = (event: ClipboardEvent) => {
      if (
        !readOnly &&
        DOMEditor.hasSelectableTarget(editor, event.target) &&
        !isEventHandled(event, attributes.onCut) &&
        !isDOMEventTargetInput(event)
      ) {
        event.preventDefault();
        selectMovableRange(editor);
        if (event.clipboardData) {
          DOMEditor.setFragmentData(editor, event.clipboardData, "cut");
        }
        const { selection } = editor;

        if (selection) {
          if (Range.isExpanded(selection)) {
            deleteMovedRange(editor, selection);
          } else {
            const node = Node.parent(editor, selection.anchor.path);
            if (Editor.isVoid(editor, node)) {
              Transforms.delete(editor);
            }
          }
        }
      }
    };

    const onDragover = (event: DragEvent) => {
      if (
        DOMEditor.hasTarget(editor, event.target) &&
        !isEventHandled(event, attributes.onDragover)
      ) {
        // Only when the target is void, call `preventDefault` to signal
        // that drops are allowed. Editable content is droppable by
        // default, and calling `preventDefault` hides the cursor.
        const node = DOMEditor.toSlateNode(editor, event.target);

        if (Node.isElement(node) && Editor.isVoid(editor, node)) {
          event.preventDefault();
        }
      }
    };

    const onDragstart = (event: DragEvent) => {
      if (
        !readOnly &&
        DOMEditor.hasTarget(editor, event.target) &&
        !isEventHandled(event, attributes.onDragstart)
      ) {
        const node = DOMEditor.toSlateNode(editor, event.target);
        const path = DOMEditor.findPath(editor, node);
        const voidMatch =
          (Node.isElement(node) && Editor.isVoid(editor, node)) ||
          Editor.void(editor, { at: path, voids: true });

        // If starting a drag on a void node, make sure it is selected
        // so that it shows up in the selection's fragment.
        if (voidMatch) {
          const range = Editor.range(editor, path);
          Transforms.select(editor, range);
        }

        selectMovableRange(editor);
        state.isDraggingInternally = true;

        if (event.dataTransfer) {
          DOMEditor.setFragmentData(editor, event.dataTransfer, "drag");
        }
      }
    };

    const onDrop = (event: DragEvent) => {
      if (
        !readOnly &&
        DOMEditor.hasTarget(editor, event.target) &&
        !isEventHandled(event, attributes.onDrop)
      ) {
        event.preventDefault();

        // Keep a reference to the dragged range before updating selection
        const draggedRange = editor.selection;

        // Find the range where the drop happened
        const range = DOMEditor.findEventRange(editor, event);
        const data = event.dataTransfer;

        Transforms.select(editor, range);

        if (state.isDraggingInternally && draggedRange) {
          if (Range.includes(draggedRange, range.anchor)) {
            return;
          }

          if (!Editor.void(editor, { at: range, voids: true })) {
            const dropRef = Editor.rangeRef(editor, range);
            deleteMovedRange(editor, draggedRange);
            const dropRange = dropRef.unref();

            if (dropRange) {
              Transforms.select(editor, dropRange);
            }
          }
        }

        if (data) {
          DOMEditor.insertData(editor, data);
        }

        // When dragging from another source into the editor, it's possible
        // that the current editor does not have focus.
        if (!DOMEditor.isFocused(editor)) {
          DOMEditor.focus(editor);
        }
      }
    };

    const onDragend = (event: DragEvent) => {
      if (
        !readOnly &&
        state.isDraggingInternally &&
        attributes.onDragend &&
        DOMEditor.hasTarget(editor, event.target)
      ) {
        attributes.onDragend(event);
      }
    };

    const onFocus = (event: FocusEvent) => {
      if (
        !readOnly &&
        !state.isUpdatingSelection &&
        DOMEditor.hasEditableTarget(editor, event.target) &&
        !isEventHandled(event, attributes.onFocus)
      ) {
        const el = DOMEditor.toDOMNode(editor, editor);
        const root = DOMEditor.findDocumentOrShadowRoot(editor);
        state.latestElement = root.activeElement;

        // COMPAT: If the editor has nested editable elements, the focus
        // can go to them. In Firefox, this must be prevented because it
        // results in issues with keyboard navigation. (2017/03/30)
        if (IS_FIREFOX && event.target !== el) {
          el.focus();
          return;
        }

        IS_FOCUSED.set(editor, true);
      }
    };

    const onKeydown = (event: KeyboardEvent) => {
      if (!readOnly && DOMEditor.hasEditableTarget(editor, event.target)) {
        androidManager?.handleKeyDown(event);

        // COMPAT: The composition end event isn't fired reliably in all browsers,
        // so we sometimes might end up stuck in a composition state even though we
        // aren't composing any more.
        if (DOMEditor.isComposing(editor) && event.isComposing === false) {
          IS_COMPOSING.set(editor, false);
          isComposing.value = false;
        }

        if (
          isEventHandled(event, attributes.onKeydown) ||
          DOMEditor.isComposing(editor)
        ) {
          return;
        }

        const { selection } = editor;
        const element =
          editor.children[selection !== null ? selection.focus.path[0] : 0];
        const isRTL = direction(Node.string(element)) === "rtl";

        // COMPAT: Since we prevent the default behavior on
        // `beforeinput` events, the browser doesn't think there's ever
        // any history stack to undo or redo, so we have to manage these
        // hotkeys ourselves. (2019/11/06)
        if (Hotkeys.isRedo(event)) {
          event.preventDefault();
          const maybeHistoryEditor: any = editor;

          if (typeof maybeHistoryEditor.redo === "function") {
            maybeHistoryEditor.redo();
          }

          return;
        }

        if (Hotkeys.isUndo(event)) {
          event.preventDefault();
          const maybeHistoryEditor: any = editor;

          if (typeof maybeHistoryEditor.undo === "function") {
            maybeHistoryEditor.undo();
          }

          return;
        }

        if (
          (IS_CHROME || IS_WEBKIT) &&
          event.key === "ArrowUp" &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey &&
          selection &&
          (event.shiftKey || Range.isCollapsed(selection))
        ) {
          const above = getPointAboveTrailingNewline(editor, selection.focus);

          if (above) {
            event.preventDefault();
            Transforms.select(
              editor,
              event.shiftKey
                ? { anchor: selection.anchor, focus: above }
                : above,
            );
            return;
          }
        }

        // COMPAT: Certain browsers don't handle the selection updates
        // properly. In Chrome, the selection isn't properly extended.
        // And in Firefox, the selection isn't properly collapsed.
        // (2017/10/17)
        if (Hotkeys.isMoveLineBackward(event)) {
          event.preventDefault();
          Transforms.move(editor, { unit: "line", reverse: true });
          return;
        }

        if (Hotkeys.isMoveLineForward(event)) {
          event.preventDefault();
          Transforms.move(editor, { unit: "line" });
          return;
        }

        if (Hotkeys.isExtendLineBackward(event)) {
          event.preventDefault();
          Transforms.move(editor, {
            unit: "line",
            edge: "focus",
            reverse: true,
          });
          return;
        }

        if (Hotkeys.isExtendLineForward(event)) {
          event.preventDefault();
          Transforms.move(editor, { unit: "line", edge: "focus" });
          return;
        }

        // COMPAT: If a void node is selected, or a zero-width text node
        // adjacent to an inline is selected, we need to handle these
        // hotkeys manually because browsers won't be able to skip over
        // the void node with the zero-width space not being an empty
        // string.
        if (Hotkeys.isMoveBackward(event)) {
          event.preventDefault();

          if (selection && Range.isCollapsed(selection)) {
            Transforms.move(editor, {
              reverse: isRTL,
              unit: getCharacterMoveUnit(editor, selection.focus, isRTL),
            });
          } else {
            Transforms.collapse(editor, {
              edge: isRTL ? "end" : "start",
            });
          }

          return;
        }

        if (Hotkeys.isMoveForward(event)) {
          event.preventDefault();

          if (selection && Range.isCollapsed(selection)) {
            Transforms.move(editor, {
              reverse: isRTL,
              unit: getCharacterMoveUnit(editor, selection.focus, isRTL),
            });
          } else {
            Transforms.collapse(editor, {
              edge: isRTL ? "start" : "end",
            });
          }

          return;
        }

        if (Hotkeys.isMoveWordBackward(event)) {
          event.preventDefault();

          if (selection && Range.isExpanded(selection)) {
            Transforms.collapse(editor, { edge: "focus" });
          }

          Transforms.move(editor, {
            unit: "word",
            reverse: !isRTL,
          });
          return;
        }

        if (Hotkeys.isMoveWordForward(event)) {
          event.preventDefault();

          if (selection && Range.isExpanded(selection)) {
            Transforms.collapse(editor, { edge: "focus" });
          }

          Transforms.move(editor, {
            unit: "word",
            reverse: isRTL,
          });
          return;
        }

        // COMPAT: Certain browsers don't support the `beforeinput` event, so we
        // fall back to guessing at the input intention for hotkeys.
        // COMPAT: In iOS, some of these hotkeys are handled in the
        if (!HAS_BEFORE_INPUT_SUPPORT) {
          // We don't have a core behavior for these, but they change the
          // DOM if we don't prevent them, so we have to.
          if (
            Hotkeys.isBold(event) ||
            Hotkeys.isItalic(event) ||
            Hotkeys.isTransposeCharacter(event)
          ) {
            event.preventDefault();
            return;
          }

          if (Hotkeys.isSoftBreak(event)) {
            event.preventDefault();
            Editor.insertSoftBreak(editor);
            return;
          }

          if (Hotkeys.isSplitBlock(event)) {
            event.preventDefault();
            Editor.insertBreak(editor);
            return;
          }

          if (Hotkeys.isDeleteBackward(event)) {
            event.preventDefault();

            if (selection && Range.isExpanded(selection)) {
              Editor.deleteFragment(editor, {
                direction: "backward",
              });
            } else {
              Editor.deleteBackward(editor);
            }

            return;
          }

          if (Hotkeys.isDeleteForward(event)) {
            event.preventDefault();

            if (selection && Range.isExpanded(selection)) {
              Editor.deleteFragment(editor, {
                direction: "forward",
              });
            } else {
              Editor.deleteForward(editor);
            }

            return;
          }

          if (Hotkeys.isDeleteLineBackward(event)) {
            event.preventDefault();

            if (selection && Range.isExpanded(selection)) {
              Editor.deleteFragment(editor, {
                direction: "backward",
              });
            } else {
              Editor.deleteBackward(editor, { unit: "line" });
            }

            return;
          }

          if (Hotkeys.isDeleteLineForward(event)) {
            event.preventDefault();

            if (selection && Range.isExpanded(selection)) {
              Editor.deleteFragment(editor, {
                direction: "forward",
              });
            } else {
              Editor.deleteForward(editor, { unit: "line" });
            }

            return;
          }

          if (Hotkeys.isDeleteWordBackward(event)) {
            event.preventDefault();

            if (selection && Range.isExpanded(selection)) {
              Editor.deleteFragment(editor, {
                direction: "backward",
              });
            } else {
              Editor.deleteBackward(editor, { unit: "word" });
            }

            return;
          }

          if (Hotkeys.isDeleteWordForward(event)) {
            event.preventDefault();

            if (selection && Range.isExpanded(selection)) {
              Editor.deleteFragment(editor, {
                direction: "forward",
              });
            } else {
              Editor.deleteForward(editor, { unit: "word" });
            }

            return;
          }
        } else {
          if (IS_CHROME || IS_WEBKIT) {
            // COMPAT: Chrome and Safari support `beforeinput` event but do not fire
            // an event when deleting backwards in a selected void inline node
            if (
              selection &&
              (Hotkeys.isDeleteBackward(event) ||
                Hotkeys.isDeleteForward(event)) &&
              Range.isCollapsed(selection)
            ) {
              const currentNode = Node.parent(editor, selection.anchor.path);

              if (
                Node.isElement(currentNode) &&
                Editor.isVoid(editor, currentNode) &&
                (Editor.isInline(editor, currentNode) ||
                  Editor.isBlock(editor, currentNode))
              ) {
                event.preventDefault();
                if (Hotkeys.isDeleteForward(event)) {
                  Editor.deleteForward(editor, { unit: "block" });
                } else {
                  Editor.deleteBackward(editor, { unit: "block" });
                }

                return;
              }
            }
          }

          if (IS_WEBKIT && selection && Range.isCollapsed(selection)) {
            if (
              Hotkeys.isDeleteBackward(event) &&
              Editor.isStart(editor, selection.anchor, [])
            ) {
              event.preventDefault();
              Editor.deleteBackward(editor);
              return;
            }

            if (
              Hotkeys.isDeleteForward(event) &&
              Editor.isEnd(editor, selection.anchor, [])
            ) {
              event.preventDefault();
              Editor.deleteForward(editor);
              return;
            }
          }
        }
      }
    };

    const onPaste = (event: ClipboardEvent) => {
      if (
        !readOnly &&
        DOMEditor.hasEditableTarget(editor, event.target) &&
        !isEventHandled(event, attributes.onPaste)
      ) {
        // COMPAT: Certain browsers don't support the `beforeinput` event, so we
        // fall back to React's `onPaste` here instead.
        // COMPAT: Firefox, Chrome and Safari don't emit `beforeinput` events
        // when "paste without formatting" is used, so fallback. (2020/02/20)
        // COMPAT: Safari InputEvents generated by pasting won't include
        // application/x-slate-fragment items, so use the
        // ClipboardEvent here. (2023/03/15)
        if (
          !HAS_BEFORE_INPUT_SUPPORT ||
          isPlainTextOnlyPaste(event) ||
          IS_WEBKIT
        ) {
          event.preventDefault();
          if (event.clipboardData) {
            DOMEditor.insertData(editor, event.clipboardData);
          }
        }
      }
    };

    const editableStyle = computed<CSSProperties>(() => {
      const normalizedStyle = normalizeStyle(attributes.style) as CSSProperties;
      return {
        // Allow positioning relative to the editable element.
        position: "relative",
        // Preserve adjacent whitespace and new lines.
        whiteSpace: "pre-wrap",
        // Allow words to break if they are too long.
        wordWrap: "break-word",
        // Make the minimum height that of the placeholder.
        minHeight: placeholderHeight.value
          ? placeholderHeight.value + "px"
          : "unset",
        ...normalizedStyle,
      };
    });

    const spellcheck = computed(() =>
      HAS_BEFORE_INPUT_SUPPORT || !CAN_USE_DOM ? attributes.spellcheck : false,
    );
    const autocorrect = computed(() =>
      HAS_BEFORE_INPUT_SUPPORT || !CAN_USE_DOM
        ? attributes.autocorrect
        : undefined,
    );
    const autocapitalize = computed(() =>
      HAS_BEFORE_INPUT_SUPPORT || !CAN_USE_DOM
        ? attributes.autocapitalize
        : undefined,
    );

    const showPlaceholder = computed(
      () =>
        Boolean(placeholder) &&
        editor.children?.length === 1 &&
        Array.from(Node.texts(editor)).length === 1 &&
        Node.string(editor) === "" &&
        !isComposing.value,
    );

    const decorate = injectDecorateFn();

    const decorations = computed(() => {
      const _decorations = decorate([editor, []]);
      if (showPlaceholder.value) {
        const start = Editor.start(editor, []);
        _decorations.push({
          [PLACEHOLDER_SYMBOL]: true,
          placeholder,
          onPlaceholderResize,
          anchor: start,
          focus: start,
        });
      }

      const { marks } = editor;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      state.hasMarkPlaceholder = false;

      if (editor.selection && Range.isCollapsed(editor.selection) && marks) {
        const { anchor } = editor.selection;
        const leaf = Node.leaf(editor, anchor.path);
        const { text, ...rest } = leaf;

        // While marks isn't a 'complete' text, we can still use loose Text.equals
        // here which only compares marks anyway.
        if (!Text.equals(leaf, marks as Text, { loose: true })) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          state.hasMarkPlaceholder = true;

          const unset = Object.fromEntries(
            Object.keys(rest).map((mark) => [mark, null]),
          );

          _decorations.push({
            [MARK_PLACEHOLDER_SYMBOL]: true,
            ...unset,
            ...marks,

            anchor,
            focus: anchor,
          });
        }
      }
      return _decorations;
    });

    // Update EDITOR_TO_MARK_PLACEHOLDER_MARKS in setTimeout useEffect to ensure we don't set it
    // before we receive the composition end event.
    onUpdated(() => {
      const { selection, marks } = editor;
      if (selection) {
        const { anchor } = selection;
        const text = Node.leaf(editor, anchor.path);

        // While marks isn't a 'complete' text, we can still use loose Text.equals
        // here which only compares marks anyway.
        if (marks && !Text.equals(text, marks as Text, { loose: true })) {
          EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, marks);
          return;
        }
      }
      EDITOR_TO_PENDING_INSERTION_MARKS.delete(editor);
    });

    return () => {
      return h(
        RestoreDOM,
        {
          node: refrestoreDOMContainer,
          receivedUserInput: receivedUserInput.value,
        },
        () =>
          h(
            attributes.is || "div",
            {
              role: readOnly ? undefined : "textbox",
              "aria-multiline": readOnly ? undefined : true,
              translate: "no",
              ...attributes,
              "data-slate-editor": true,
              "data-slate-node": "value",
              zindex: -1,
              spellcheck: spellcheck.value,
              autocorrect: autocorrect.value,
              autocapitalize: autocapitalize.value,
              contenteditable: !readOnly,
              ref: editableRef,
              style: editableStyle.value,
              onBeforeinput,
              onInput,
              onBlur,
              onClick,
              onCompositionend,
              onCompositionupdate,
              onCompositionstart,
              onCopy,
              onCut,
              onDragover,
              onDragstart,
              onDrop,
              onDragend,
              onFocus,
              onKeydown,
              onPaste,
            },
            h(ChildrenComp, {
              element: editor,
              decorations: decorations.value,
            }),
          ),
      );
    };
  },
});
