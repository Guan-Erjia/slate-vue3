import {
  applyStringDiff,
  DOMEditor,
  isDOMSelection,
  normalizeStringDiff,
  StringDiff,
} from "slate-dom";
import { Editor, Node, Path, Point, Range, Text, Transforms } from "slate";
import { onMounted, ref, type Ref } from "vue";
import { useEditor } from "./use-editor";

const MUTATION_OBSERVER_CONFIG: MutationObserverInit = {
  subtree: true,
  childList: true,
  characterData: true,
  characterDataOldValue: true,
};

export interface AndroidManager {
  // handleCompositionStart: (event: CompositionEvent) => void;
  // handleCompositionUpdate: (event: CompositionEvent) => void;
  // handleCompositionEnd: (event: CompositionEvent) => void;
  handleDOMBeforeInput: (event: InputEvent) => void;
  // handleKeyDown: (event: KeyboardEvent) => void;
  // handleInput: (event: InputEvent) => void;
}

export const useAndroidManager = (
  editableRef: Ref<HTMLElement | undefined>
): AndroidManager => {
  const editor = useEditor();
  const mutationObserver = ref<MutationObserver>();
  const schedule = ref<() => void>();
  let insertPositionHint: StringDiff | null | false = false;
  onMounted(() => {
    mutationObserver.value = new MutationObserver((mutations) => {
      mutationObserver.value?.disconnect();
      mutationObserver.value?.takeRecords();
      mutations.reverse().forEach((mutation) => {
        if (mutation.type === "characterData") {
          // We don't want to restore the DOM for characterData mutations
          // because this interrupts the composition.
          return;
        }
        mutation.removedNodes.forEach((node) => {
          mutation.target.insertBefore(node, mutation.nextSibling);
        });
        mutation.addedNodes.forEach((node) => {
          mutation.target.removeChild(node);
        });
      });

      schedule.value?.();
      schedule.value = undefined;
    });
  });

  const scheduleAction = (run: () => void, at?: Point | Range): void => {
    insertPositionHint = false;
    schedule.value = run;
  };

  const storeDiff = (path: Path, diff: StringDiff) => {
    const target = Node.leaf(editor, path);
    const normalized = normalizeStringDiff(target.text, diff);
    if (!normalized) {
      return;
    }
    scheduleAction(() => {
      if (normalized.start !== normalized.end) {
        if (normalized.text) {
          Editor.deleteBackward(editor, { unit: "word" });
        } else {
          Editor.deleteBackward(editor, { unit: "character" });
        }
      }
      Editor.insertText(editor, normalized.text);
    });
  };

  const handleDOMBeforeInput = (event: InputEvent) => {
    mutationObserver.value?.observe(
      editableRef.value!,
      MUTATION_OBSERVER_CONFIG
    );

    const { inputType: type } = event;
    let targetRange: Range | null = null;
    const data: DataTransfer | string | undefined =
      (event as any).dataTransfer || event.data || undefined;

    if (
      insertPositionHint !== false &&
      type !== "insertText" &&
      type !== "insertCompositionText"
    ) {
      insertPositionHint = false;
    }

    let [nativeTargetRange] = (event as any).getTargetRanges();
    if (nativeTargetRange) {
      targetRange = DOMEditor.toSlateRange(editor, nativeTargetRange, {
        exactMatch: false,
        suppressThrow: true,
      });
    }

    // COMPAT: SelectionChange event is fired after the action is performed, so we
    // have to manually get the selection here to ensure it's up-to-date.
    const window = DOMEditor.getWindow(editor);
    const domSelection = window.getSelection();
    if (!targetRange && domSelection) {
      nativeTargetRange = domSelection;
      targetRange = DOMEditor.toSlateRange(editor, domSelection, {
        exactMatch: false,
        suppressThrow: true,
      });
    }

    targetRange = targetRange ?? editor.selection;
    if (!targetRange) {
      return;
    }

    // By default, the input manager tries to store text diffs so that we can
    // defer flushing them at a later point in time. We don't want to flush
    // for every input event as this can be expensive. However, there are some
    // scenarios where we cannot safely store the text diff and must instead
    // schedule an action to let Slate normalize the editor state.
    let canStoreDiff = true;

    if (type.startsWith("delete")) {
      const direction = type.endsWith("Backward") ? "backward" : "forward";
      let [start, end] = Range.edges(targetRange);
      let [leaf, path] = Editor.leaf(editor, start.path);

      if (Range.isExpanded(targetRange)) {
        if (leaf.text.length === start.offset && end.offset === 0) {
          const next = Editor.next(editor, {
            at: start.path,
            match: Text.isText,
          });
          if (next && Path.equals(next[1], end.path)) {
            // when deleting a linebreak, targetRange will span across the break (ie start in the node before and end in the node after)
            // if the node before is empty, this will look like a hanging range and get unhung later--which will take the break we want to remove out of the range
            // so to avoid this we collapse the target range to default to single character deletion
            if (direction === "backward") {
              targetRange = { anchor: end, focus: end };
              start = end;
              [leaf, path] = next;
            } else {
              targetRange = { anchor: start, focus: start };
              end = start;
            }
          }
        }
      }

      const diff = {
        text: "",
        start: start.offset,
        end: end.offset,
      };
      const diffs = [diff];
      const text = applyStringDiff(leaf.text, ...diffs);

      if (text.length === 0) {
        // Text leaf will be removed, so we need to schedule an
        // action to remove it so that Slate can normalize instead
        // of storing as a diff
        canStoreDiff = false;
      }

      if (Range.isExpanded(targetRange)) {
        if (
          canStoreDiff &&
          Path.equals(targetRange.anchor.path, targetRange.focus.path)
        ) {
          const point = { path: targetRange.anchor.path, offset: start.offset };
          const range = Editor.range(editor, point, point);
          // handleUserSelect(range);

          return storeDiff(targetRange.anchor.path, {
            text: "",
            end: end.offset,
            start: start.offset,
          });
        }

        return scheduleAction(
          () => Editor.deleteFragment(editor, { direction }),
          targetRange
        );
      }
    }

    switch (type) {
      case "deleteByComposition":
      case "deleteByCut":
      case "deleteByDrag": {
        return scheduleAction(() => Editor.deleteFragment(editor), targetRange);
      }

      case "deleteContent":
      case "deleteContentForward": {
        const { anchor } = targetRange;
        if (canStoreDiff && Range.isCollapsed(targetRange)) {
          const targetNode = Node.leaf(editor, anchor.path);

          if (anchor.offset < targetNode.text.length) {
            return storeDiff(anchor.path, {
              text: "",
              start: anchor.offset,
              end: anchor.offset + 1,
            });
          }
        }

        return scheduleAction(() => Editor.deleteForward(editor), targetRange);
      }

      case "deleteContentBackward": {
        const { anchor } = targetRange;

        // If we have a mismatch between the native and slate selection being collapsed
        // we are most likely deleting a zero-width placeholder and thus should perform it
        // as an action to ensure correct behavior (mostly happens with mark placeholders)
        const nativeCollapsed = isDOMSelection(nativeTargetRange)
          ? nativeTargetRange.isCollapsed
          : !!nativeTargetRange?.collapsed;

        if (
          canStoreDiff &&
          nativeCollapsed &&
          Range.isCollapsed(targetRange) &&
          anchor.offset > 0
        ) {
          return storeDiff(anchor.path, {
            text: "",
            start: anchor.offset - 1,
            end: anchor.offset,
          });
        }

        return scheduleAction(() => Editor.deleteBackward(editor), targetRange);
      }

      case "deleteEntireSoftLine": {
        return scheduleAction(() => {
          Editor.deleteBackward(editor, { unit: "line" });
          Editor.deleteForward(editor, { unit: "line" });
        }, targetRange);
      }

      case "deleteHardLineBackward": {
        return scheduleAction(
          () => Editor.deleteBackward(editor, { unit: "block" }),
          targetRange
        );
      }

      case "deleteSoftLineBackward": {
        return scheduleAction(
          () => Editor.deleteBackward(editor, { unit: "line" }),
          targetRange
        );
      }

      case "deleteHardLineForward": {
        return scheduleAction(
          () => Editor.deleteForward(editor, { unit: "block" }),
          targetRange
        );
      }

      case "deleteSoftLineForward": {
        return scheduleAction(
          () => Editor.deleteForward(editor, { unit: "line" }),
          targetRange
        );
      }

      case "deleteWordBackward": {
        return scheduleAction(
          () => Editor.deleteBackward(editor, { unit: "word" }),
          targetRange
        );
      }

      case "deleteWordForward": {
        return scheduleAction(
          () => Editor.deleteForward(editor, { unit: "word" }),
          targetRange
        );
      }

      case "insertLineBreak": {
        return scheduleAction(
          () => Editor.insertSoftBreak(editor),
          targetRange
        );
      }

      case "insertParagraph": {
        return scheduleAction(() => Editor.insertBreak(editor), targetRange);
      }
      case "insertCompositionText":
      case "deleteCompositionText":
      case "insertFromComposition":
      case "insertFromDrop":
      case "insertFromPaste":
      case "insertFromYank":
      case "insertReplacementText":
      case "insertText": {
        if (data instanceof DataTransfer) {
          return scheduleAction(
            () => DOMEditor.insertData(editor, data),
            targetRange
          );
        }

        let text = data ?? "";

        // Pastes from the Android clipboard will generate `insertText` events.
        // If the copied text contains any newlines, Android will append an
        // extra newline to the end of the copied text.
        if (type === "insertText" && /.*\n.*\n$/.test(text)) {
          text = text.slice(0, -1);
        }

        // If the text includes a newline, split it at newlines and paste each component
        // string, with soft breaks in between each.
        if (text.includes("\n")) {
          return scheduleAction(() => {
            const parts = text.split("\n");
            parts.forEach((line, i) => {
              if (line) {
                Editor.insertText(editor, line);
              }
              if (i !== parts.length - 1) {
                Editor.insertSoftBreak(editor);
              }
            });
          }, targetRange);
        }

        if (Path.equals(targetRange.anchor.path, targetRange.focus.path)) {
          const [start, end] = Range.edges(targetRange);

          const diff = {
            start: start.offset,
            end: end.offset,
            text,
          };
          // COMPAT: Swiftkey has a weird bug where the target range of the 2nd word
          // inserted after a mark placeholder is inserted with an anchor offset off by 1.
          // So writing 'some text' will result in 'some ttext'. Luckily all 'normal' insert
          // text events are fired with the correct target ranges, only the final 'insertComposition'
          // isn't, so we can adjust the target range start offset if we are confident this is the
          // swiftkey insert causing the issue.
          if (text && insertPositionHint && type === "insertCompositionText") {
            const hintPosition =
              insertPositionHint.start + insertPositionHint.text.search(/\S|$/);
            const diffPosition = diff.start + diff.text.search(/\S|$/);

            if (
              diffPosition === hintPosition + 1 &&
              diff.end ===
                insertPositionHint.start + insertPositionHint.text.length
            ) {
              diff.start -= 1;
              insertPositionHint = null;
            } else {
              insertPositionHint = false;
            }
          } else if (type === "insertText") {
            if (insertPositionHint === null) {
              insertPositionHint = diff;
            } else if (
              insertPositionHint &&
              Range.isCollapsed(targetRange) &&
              insertPositionHint.end + insertPositionHint.text.length ===
                start.offset
            ) {
              insertPositionHint = {
                ...insertPositionHint,
                text: insertPositionHint.text + text,
              };
            } else {
              insertPositionHint = false;
            }
          } else {
            insertPositionHint = false;
          }

          if (canStoreDiff) {
            const currentSelection = editor.selection;
            storeDiff(start.path, diff);

            if (currentSelection) {
              const newPoint = {
                path: start.path,
                offset: start.offset + text.length,
              };

              scheduleAction(() => {
                Transforms.select(editor, {
                  anchor: newPoint,
                  focus: newPoint,
                });
              }, newPoint);
            }
            return;
          }
        }

        return scheduleAction(
          () => Editor.insertText(editor, text),
          targetRange
        );
      }
    }
  };

  // const buffComposeEvent = ref<CompositionEvent>();
  // const handleCompositionEnd = (_event: CompositionEvent) => {
  //   buffComposeEvent.value = _event;
  // };
  // const handleCompositionStart = (_event: CompositionEvent) => {
  //   buffComposeEvent.value = _event;
  // };
  // const handleCompositionUpdate = (_event: CompositionEvent) => {
  //   buffComposeEvent.value = _event;
  // };
  // const handleInput = (_: InputEvent) => {};

  // const handleKeyDown = (_: KeyboardEvent) => {};

  return {
    handleDOMBeforeInput,
  };
};
