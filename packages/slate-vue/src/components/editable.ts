import { direction } from "direction";
import { Editor, Element, Node, Path, Range, Text, Transforms } from "slate";
import { useAndroidInputManager } from "../hooks/android-input-manager/use-android-input-manager";
import {
  DOMEditor,
  TRIPLE_CLICK,
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
  EDITOR_TO_FORCE_RENDER,
  EDITOR_TO_PENDING_INSERTION_MARKS,
  EDITOR_TO_USER_MARKS,
  EDITOR_TO_USER_SELECTION,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  IS_COMPOSING,
  IS_FOCUSED,
  IS_READ_ONLY,
  NODE_TO_ELEMENT,
} from "slate-dom";

import type { AndroidInputManager } from "../hooks/android-input-manager/android-input-manager";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  provide,
  reactive,
  ref,
  useAttrs,
  watch,
} from "vue";
import type { CSSProperties, HTMLAttributes } from "vue";
import { ChildrenFC } from "./children";
import { useRestoreDOM } from "../hooks/use-restore-dom";
import type { EditableProps } from "../utils/interface";
import {
  defaultScrollSelectionIntoView,
  isDOMEventHandled,
  isDOMEventTargetInput,
  isEventHandled,
} from "./utils";
import { useEditor } from "../hooks/use-editor";
import { useComposing } from "../hooks/use-composing";
import { useReadOnly } from "../hooks/use-read-only";
import { useChangeEffect } from "../hooks/use-render";
import { PlaceholderComp } from "./placeholder";
import { useDecorate } from "../hooks/use-decorate";
import { SLATE_INNER_DESCORATION } from "../utils/constants";

export const Editable = defineComponent({
  name: "slate-editable",
  props: {
    scrollSelectionIntoView: {
      type: Function,
      required: false,
      default: () => defaultScrollSelectionIntoView,
    },
    placeholder: { type: String },
    readOnly: {
      type: Boolean,
      default: () => false,
    },
    role: { type: String },
    style: {
      type: Object,
      default: () => {},
    },
    is: {
      type: String,
      default: () => "div",
    },
  },
  setup(props: EditableProps) {
    const { placeholder, readOnly, scrollSelectionIntoView, is } = props;

    const editor = useEditor();
    const attributes: HTMLAttributes = useAttrs();
    const isComposing = useComposing();

    const deferredOperations = ref<Array<() => void>>([]);

    const proxy = getCurrentInstance();
    EDITOR_TO_FORCE_RENDER.set(editor, () => proxy?.update());

    // Update internal state on each render.
    const isReadOnly = useReadOnly();
    watch(
      () => readOnly,
      (current) => {
        IS_READ_ONLY.set(editor, current);
        isReadOnly.value = current;
      }
    );

    // Keep track of some state for the event handler logic.
    const state = reactive<{
      isDraggingInternally: boolean;
      latestElement: globalThis.Element | null;
    }>({
      isDraggingInternally: false,
      latestElement: null,
    });

    const placeholderHeight = ref<number>();
    const onPlaceholderResize = (h?: number) => (placeholderHeight.value = h);

    /**
     * The AndroidInputManager object has a cyclical dependency on onDOMSelectionChange
     *
     * It is defined as a reference to simplify hook dependencies and clarify that
     * it needs to be initialized.
     */
    // Listen on the native `selectionchange` event to be able to update any time
    // the selection changes. This is required because React's `onSelect` is leaky
    // and non-standard so it doesn't fire until after a selection has been
    // released. This causes issues in situations where another change happens
    // while a selection is being dragged.
    const androidInputManagerRef = ref<AndroidInputManager | null>(null);

    // should it be a throttled function?
    const onDOMSelectionChange = (event?: Event) => {
      const target = event?.target;
      const targetElement = target instanceof HTMLElement ? target : null;
      const targetTagName = targetElement?.tagName;
      if (targetTagName === "INPUT" || targetTagName === "TEXTAREA") {
        return;
      }

      const el = DOMEditor.toDOMNode(editor, editor);
      const root = el.getRootNode();

      if (IS_WEBKIT && root instanceof ShadowRoot) {
        const active = getActiveElement();

        if (active) {
          document.execCommand("indent");
        } else {
          Transforms.deselect(editor);
        }

        return;
      }

      const androidInputManager = androidInputManagerRef.value;
      if (
        (IS_ANDROID || !DOMEditor.isComposing(editor)) &&
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

        if (anchorNodeSelectable && focusNodeInEditor) {
          const range = DOMEditor.toSlateRange(editor, domSelection, {
            exactMatch: false,
            suppressThrow: true,
          });
          if (range) {
            if (
              !DOMEditor.isComposing(editor) &&
              !androidInputManager?.hasPendingChanges() &&
              !androidInputManager?.isFlushing()
            ) {
              Transforms.select(editor, range);
            } else {
              androidInputManager?.handleUserSelect(range);
            }
          }
        }

        // Deselect the editor if the dom selection is not selectable in readonly mode
        if (readOnly && (!anchorNodeSelectable || !focusNodeInEditor)) {
          Transforms.deselect(editor);
        }
      }
    };
    const editableRef = ref<HTMLElement>();
    androidInputManagerRef.value = useAndroidInputManager({
      node: editableRef,
      onDOMSelectionChange,
    });

    const { onUserInput } = useRestoreDOM(editableRef, editor);

    // callbackRef
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

    const hasMarkPlaceholder = computed(() => {
      if (
        editor.selection &&
        Range.isCollapsed(editor.selection) &&
        editor.marks
      ) {
        const anchor = editor.selection.anchor;
        const leaf = Node.leaf(editor, anchor.path);
        // While marks isn't a 'complete' text, we can still use loose Text.equals
        // here which only compares marks anyway.
        if (!Text.equals(leaf, editor.marks as Text, { loose: true })) {
          return true;
        }
      } else {
        return false;
      }
    });
    const setDomSelection = () => {
      const root = DOMEditor.findDocumentOrShadowRoot(editor);
      const domSelection = getSelection(root);
      if (!domSelection) {
        return;
      }
      const hasDomSelection = domSelection.type !== "None";

      // If the DOM selection is properly unset, we're done.
      if (!editor.selection && !hasDomSelection) {
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
        editorElement.contains(anchorNode) &&
        editorElement.contains(focusNode)
      ) {
        hasDomSelectionInEditor = true;
      }

      // If the DOM selection is in the editor and the editor selection is already correct, we're done.
      if (hasDomSelection && hasDomSelectionInEditor && editor.selection) {
        const slateRange = DOMEditor.toSlateRange(editor, domSelection, {
          exactMatch: true,

          // domSelection is not necessarily a valid Slate range
          // (e.g. when clicking on contentEditable:false element)
          suppressThrow: true,
        });

        if (slateRange && Range.equals(slateRange, editor.selection)) {
          if (!hasMarkPlaceholder.value) {
            return;
          }

          // Ensure selection is inside the mark placeholder
          if (
            anchorNode?.parentElement?.hasAttribute(
              "data-slate-mark-placeholder"
            )
          ) {
            return;
          }
        }
      }

      // when <Editable/> is being controlled through external value
      // then its children might just change - DOM responds to it on its own
      // but Slate's value is not being updated through any operation
      // and thus it doesn't transform selection on its own
      if (editor.selection && !DOMEditor.hasRange(editor, editor.selection)) {
        editor.selection = DOMEditor.toSlateRange(editor, domSelection, {
          exactMatch: false,
          suppressThrow: true,
        });
        return;
      }

      let newDomRange: globalThis.Range | null = null;

      try {
        newDomRange =
          editor.selection && DOMEditor.toDOMRange(editor, editor.selection);
      } catch (e) {
        // Ignore, dom and state might be out of sync
      }

      if (newDomRange) {
        if (DOMEditor.isComposing(editor) && !IS_ANDROID) {
          domSelection.collapseToEnd();
        } else if (Range.isBackward(editor.selection!)) {
          domSelection.setBaseAndExtent(
            newDomRange.endContainer,
            newDomRange.endOffset,
            newDomRange.startContainer,
            newDomRange.startOffset
          );
        } else {
          domSelection.setBaseAndExtent(
            newDomRange.startContainer,
            newDomRange.startOffset,
            newDomRange.endContainer,
            newDomRange.endOffset
          );
        }
        scrollSelectionIntoView(editor, newDomRange);
      } else {
        domSelection.removeAllRanges();
      }

      return newDomRange;
    };

    useChangeEffect(() => {
      // Make sure the DOM selection state is in sync.
      const root = DOMEditor.findDocumentOrShadowRoot(editor);
      const domSelection = getSelection(root);
      if (
        !domSelection ||
        !DOMEditor.isFocused(editor) ||
        androidInputManagerRef.value?.hasPendingAction()
      ) {
        return;
      }

      // In firefox if there is more then 1 range and we call setDomSelection we remove the ability to select more cells in a table
      if (domSelection.rangeCount <= 1) {
        setDomSelection();
      }

      const ensureSelection =
        androidInputManagerRef.value?.isFlushing() === "action";

      if (!IS_ANDROID || !ensureSelection) {
        return;
      }
    });

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
      window.document.addEventListener("selectionchange", onDOMSelectionChange);
      window.document.addEventListener("dragend", stoppedDragging);
      window.document.addEventListener("drop", stoppedDragging);
    });
    onUnmounted(() => {
      const window = DOMEditor.getWindow(editor);
      window.document.removeEventListener(
        "selectionchange",
        onDOMSelectionChange
      );
      window.document.removeEventListener("dragend", stoppedDragging);
      window.document.removeEventListener("drop", stoppedDragging);
    });

    const onBeforeinput = (event: Event) => {
      const isInputEvent = event instanceof InputEvent;
      if (!isInputEvent) {
        return;
      }
      if (HAS_BEFORE_INPUT_SUPPORT) {
        const el = DOMEditor.toDOMNode(editor, editor);
        const root = el.getRootNode();

        if (IS_WEBKIT && root instanceof ShadowRoot) {
          const ranges = event.getTargetRanges();
          const range = ranges[0];

          const newRange = new window.Range();

          newRange.setStart(range.startContainer, range.startOffset);
          newRange.setEnd(range.endContainer, range.endOffset);

          // Translate the DOM Range into a Slate Range
          const slateRange = DOMEditor.toSlateRange(editor, newRange, {
            exactMatch: false,
            suppressThrow: false,
          });

          Transforms.select(editor, slateRange);

          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        onUserInput();

        if (
          !readOnly &&
          DOMEditor.hasEditableTarget(editor, event.target) &&
          !isDOMEventHandled(event, attributes.onBeforeinput)
        ) {
          // COMPAT: BeforeInput events aren't cancelable on android, so we have to handle them differently using the android input manager.
          if (androidInputManagerRef.value) {
            return androidInputManagerRef.value.handleDOMBeforeInput(event);
          }

          const { selection } = editor;
          const { inputType } = event;
          const data = (event as any).dataTransfer || event.data || undefined;

          const isCompositionChange =
            inputType === "insertCompositionText" ||
            inputType === "deleteCompositionText";

          // COMPAT: use composition change events as a hint to where we should insert
          // composition text if we aren't composing to work around https://github.com/ianstormtaylor/slate/issues/5038
          if (isCompositionChange && DOMEditor.isComposing(editor)) {
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
                match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
              });

              if (block && Node.string(block[0]).includes("\t")) {
                native = false;
              }
            }
          }
          // COMPAT: For the deleting forward/backward input types we don't want
          // to change the selection because it is the range that will be deleted,
          // and those commands determine that for themselves.
          // If the NODE_MAP is dirty, we can't trust the selection anchor (eg DOMEditor.toDOMPoint via DOMEditor.toSlateRange)
          if (
            !inputType.startsWith("delete") ||
            inputType.startsWith("deleteBy")
          ) {
            const [targetRange] = event.getTargetRanges();

            if (targetRange) {
              const range = DOMEditor.toSlateRange(editor, targetRange, {
                exactMatch: false,
                suppressThrow: false,
              });

              if (!selection || !Range.equals(selection, range)) {
                native = false;

                const selectionRef =
                  !isCompositionChange &&
                  editor.selection &&
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
                    Editor.insertText(editor, data)
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
      } else if (
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

    const onInput = (event: Event) => {
      if (isEventHandled(event, attributes.onInput)) {
        return;
      }

      if (androidInputManagerRef.value) {
        androidInputManagerRef.value.handleInput();
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
        const maybeHistoryEditor: any = editor;
        if (
          "inputType" in event &&
          event.inputType === "historyUndo" &&
          typeof maybeHistoryEditor.undo === "function"
        ) {
          maybeHistoryEditor.undo();
          return;
        }
        if (
          "inputType" in event &&
          event.inputType === "historyRedo" &&
          typeof maybeHistoryEditor.redo === "function"
        ) {
          maybeHistoryEditor.redo();
          return;
        }
      }
    };

    const onBlur = (event: FocusEvent) => {
      if (
        readOnly ||
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

        if (Element.isElement(node) && !editor.isVoid(node)) {
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

    const onClick = (event: MouseEvent) => {
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
        if (!Editor.hasPath(editor, path) || Node.get(editor, path) !== node) {
          return;
        }

        if (event.detail === TRIPLE_CLICK && path.length >= 1) {
          let blockPath = path;
          if (!(Element.isElement(node) && Editor.isBlock(editor, node))) {
            const block = Editor.above(editor, {
              match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
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

        if (startVoid && endVoid && Path.equals(startVoid[1], endVoid[1])) {
          const range = Editor.range(editor, start);
          Transforms.select(editor, range);
        }
      }
    };

    const onCompositionend = (event: CompositionEvent) => {
      if (DOMEditor.hasSelectableTarget(editor, event.target)) {
        if (DOMEditor.isComposing(editor)) {
          Promise.resolve().then(() => {
            isComposing.value = false;
            IS_COMPOSING.set(editor, false);
          });
        }

        androidInputManagerRef.value?.handleCompositionEnd(event);

        if (isEventHandled(event, attributes.onCompositionend) || IS_ANDROID) {
          return;
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

          Editor.insertText(editor, event.data);

          const userMarks = EDITOR_TO_USER_MARKS.get(editor);
          EDITOR_TO_USER_MARKS.delete(editor);
          if (userMarks !== undefined) {
            editor.marks = userMarks;
          }
        }
      }
    };

    const onCompositionupdate = (event: CompositionEvent) => {
      if (
        DOMEditor.hasSelectableTarget(editor, event.target) &&
        !isEventHandled(event, attributes.onCompositionupdate)
      ) {
        if (!DOMEditor.isComposing(editor)) {
          isComposing.value = true;
          IS_COMPOSING.set(editor, true);
        }
      }
    };

    const onCompositionstart = (event: CompositionEvent) => {
      if (DOMEditor.hasSelectableTarget(editor, event.target)) {
        androidInputManagerRef.value?.handleCompositionStart(event);

        if (
          isEventHandled(event, attributes.onCompositionstart) ||
          IS_ANDROID
        ) {
          return;
        }

        isComposing.value = true;

        const { selection } = editor;
        if (selection && Range.isExpanded(selection)) {
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
        event.clipboardData &&
          DOMEditor.setFragmentData(editor, event.clipboardData, "copy");
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
        event.clipboardData &&
          DOMEditor.setFragmentData(editor, event.clipboardData, "cut");
        const selection = editor.selection;

        if (selection) {
          if (Range.isExpanded(selection)) {
            Editor.deleteFragment(editor);
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

        if (Element.isElement(node) && Editor.isVoid(editor, node)) {
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
          (Element.isElement(node) && Editor.isVoid(editor, node)) ||
          Editor.void(editor, { at: path, voids: true });

        // If starting a drag on a void node, make sure it is selected
        // so that it shows up in the selection's fragment.
        if (voidMatch) {
          const range = Editor.range(editor, path);
          Transforms.select(editor, range);
        }

        state.isDraggingInternally = true;

        event.dataTransfer &&
          DOMEditor.setFragmentData(editor, event.dataTransfer, "drag");
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

        if (state.isDraggingInternally) {
          if (
            draggedRange &&
            !Range.equals(draggedRange, range) &&
            !Editor.void(editor, { at: range, voids: true })
          ) {
            Transforms.delete(editor, {
              at: draggedRange,
            });
          }
        }

        data && DOMEditor.insertData(editor, data);

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
        androidInputManagerRef.value?.handleKeyDown(event);

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

        const element =
          editor.children[
            editor.selection !== null ? editor.selection.focus.path[0] : 0
          ];
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

          if (editor.selection && Range.isCollapsed(editor.selection)) {
            Transforms.move(editor, { reverse: !isRTL });
          } else {
            Transforms.collapse(editor, {
              edge: isRTL ? "end" : "start",
            });
          }

          return;
        }

        if (Hotkeys.isMoveForward(event)) {
          event.preventDefault();

          if (editor.selection && Range.isCollapsed(editor.selection)) {
            Transforms.move(editor, { reverse: isRTL });
          } else {
            Transforms.collapse(editor, {
              edge: isRTL ? "start" : "end",
            });
          }

          return;
        }

        if (Hotkeys.isMoveWordBackward(event)) {
          event.preventDefault();

          if (editor.selection && Range.isExpanded(editor.selection)) {
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

          if (editor.selection && Range.isExpanded(editor.selection)) {
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

            if (editor.selection && Range.isExpanded(editor.selection)) {
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

            if (editor.selection && Range.isExpanded(editor.selection)) {
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

            if (editor.selection && Range.isExpanded(editor.selection)) {
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

            if (editor.selection && Range.isExpanded(editor.selection)) {
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

            if (editor.selection && Range.isExpanded(editor.selection)) {
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

            if (editor.selection && Range.isExpanded(editor.selection)) {
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
              editor.selection &&
              (Hotkeys.isDeleteBackward(event) ||
                Hotkeys.isDeleteForward(event)) &&
              Range.isCollapsed(editor.selection)
            ) {
              const currentNode = Node.parent(
                editor,
                editor.selection.anchor.path
              );

              if (
                Element.isElement(currentNode) &&
                Editor.isVoid(editor, currentNode) &&
                (Editor.isInline(editor, currentNode) ||
                  Editor.isBlock(editor, currentNode))
              ) {
                event.preventDefault();
                Editor.deleteBackward(editor, { unit: "block" });

                return;
              }
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
          event.clipboardData &&
            DOMEditor.insertData(editor, event.clipboardData);
        }
      }
    };

    // Update EDITOR_TO_MARK_PLACEHOLDER_MARKS in setTimeout useEffect to ensure we don't set it
    // before we receive the composition end event.
    onBeforeUpdate(() => {
      if (editor.selection) {
        const text = Node.leaf(editor, editor.selection.anchor.path);
        // While marks isn't a 'complete' text, we can still use loose Text.equals
        // here which only compares marks anyway.
        if (
          editor.marks &&
          !Text.equals(text, editor.marks as Text, { loose: true })
        ) {
          EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, editor.marks);
          return;
        }
      }
      EDITOR_TO_PENDING_INSERTION_MARKS.delete(editor);
    });

    const mergedEditableStyle = computed<CSSProperties>(() => ({
      // Allow positioning relative to the editable element.
      position: "relative",
      // Preserve adjacent whitespace and new lines.
      whiteSpace: "pre-wrap",
      // Allow words to break if they are too long.
      wordWrap: "break-word",
      // Make the minimum height that of the placeholder.
      minHeight: placeholderHeight.value
        ? placeholderHeight.value + "px"
        : undefined,
      // Allow for passed-in styles to override anything.
      ...props.style,
    }));

    const spellcheck = computed(() =>
      HAS_BEFORE_INPUT_SUPPORT || !CAN_USE_DOM ? attributes.spellcheck : false
    );
    const autocorrect = computed(() =>
      HAS_BEFORE_INPUT_SUPPORT || !CAN_USE_DOM
        ? attributes.autocorrect
        : undefined
    );
    const autocapitalize = computed(() =>
      HAS_BEFORE_INPUT_SUPPORT || !CAN_USE_DOM
        ? attributes.autocapitalize
        : undefined
    );

    const decorate = useDecorate();
    const descProvide = computed(() => decorate([editor, []]));
    provide(SLATE_INNER_DESCORATION, descProvide);

    return () =>
      h(
        is,
        {
          role: readOnly ? undefined : "textbox",
          "aria-multiline": readOnly ? undefined : true,
          "data-slate-editor": true,
          "data-slate-node": "value",
          ...attributes,
          zindex: -1,
          spellcheck: spellcheck.value,
          autocorrect: autocorrect.value,
          autocapitalize: autocapitalize.value,
          contenteditable: !readOnly,
          ref: editableRef,
          style: mergedEditableStyle.value,
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
        [
          ChildrenFC(editor, editor),
          h(PlaceholderComp, {
            placeholder,
            onPlaceholderResize,
          }),
        ]
      );
  },
});
