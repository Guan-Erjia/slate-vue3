<script setup lang="ts">
import {
  Slate,
  Editable,
  type RenderElementProps,
  createReactiveEditor,
} from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";
import { computed, h, onBeforeUnmount, onMounted, ref } from "vue";
import { Node, Range, type Descendant, type Editor, type Point } from "slate";
import { withHistory } from "slate-history";

const MAX_ENTRIES = 500;

const LOGGED_EVENTS = [
  "keydown",
  "beforeinput",
  "input",
  "compositionstart",
  "compositionupdate",
  "compositionend",
] as const;

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "Type here to log the events your keyboard sends." }],
  },
  {
    type: "paragraph",
    children: [{ text: "A second paragraph, followed by a quote:" }],
  },
  {
    type: "block-quote",
    children: [{ text: "A wise quote." }],
  },
];

const formatPoint = (point: Point) => `${point.path.join(".")}:${point.offset}`;

const formatSelection = (editor: Editor) => {
  const { selection } = editor;
  if (!selection) return "none";
  if (Range.isCollapsed(selection)) return formatPoint(selection.anchor);
  return `${formatPoint(selection.anchor)}-${formatPoint(selection.focus)}`;
};

const formatEvent = (event: Event) => {
  if (event instanceof KeyboardEvent) {
    return `key=${JSON.stringify(event.key)} code=${event.keyCode}`;
  }
  if (event instanceof CompositionEvent) {
    return `data=${JSON.stringify(event.data)}`;
  }
  if (event instanceof InputEvent) {
    const ranges = event
      .getTargetRanges()
      .map((range) => `${range.startOffset}-${range.endOffset}`)
      .join(",");
    return [
      event.inputType,
      JSON.stringify(event.data),
      event.isComposing ? "composing" : "",
      ranges ? `ranges=${ranges}` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }
  return "";
};

const focusedBlockText = (editor: Editor) =>
  editor.selection
    ? Node.string(Node.get(editor, editor.selection.anchor.path.slice(0, 1)))
    : "";

const editor = withHistory(createReactiveEditor());

const entries = ref<string[]>([]);
const startTime = ref<number | null>(null);
const logRef = ref<HTMLTextAreaElement | null>(null);

const record = (type: string, detail: string) => {
  const now = performance.now();
  if (startTime.value === null) startTime.value = now;
  const elapsed = Math.round(now - startTime.value);
  entries.value = [...entries.value, `+${elapsed}ms ${type} ${detail}`].slice(
    -MAX_ENTRIES,
  );
};

const handleChange = () => {
  record(
    "change",
    `${JSON.stringify(focusedBlockText(editor))} sel=${formatSelection(editor)}`,
  );
};

const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) =>
  element.type === "block-quote"
    ? h("blockquote", attributes, children)
    : h("p", attributes, children);

let root: HTMLElement | null = null;

const listener = (event: Event) =>
  record(
    event.type,
    `${formatEvent(event)} sel=${formatSelection(editor)}`.trim(),
  );

onMounted(() => {
  root = DOMEditor.toDOMNode(editor, editor);
  LOGGED_EVENTS.forEach((type) => root!.addEventListener(type, listener, true));
});

onBeforeUnmount(() => {
  if (!root) return;
  LOGGED_EVENTS.forEach((type) =>
    root!.removeEventListener(type, listener, true),
  );
});

const log = computed(() =>
  [`userAgent ${navigator.userAgent}`, ...entries.value].join("\n"),
);

const copyLog = () => {
  const select = () => logRef.value?.select();
  if (!navigator.clipboard) return select();
  navigator.clipboard.writeText(log.value).catch(select);
};

const clearLog = () => {
  startTime.value = null;
  entries.value = [];
};
</script>

<template>
  <div>
    <p>
      Reproduce the bug in the editor, then copy the log below and paste it into
      the issue with your keyboard app and OS version. Nothing is sent anywhere.
    </p>
    <Slate :editor :initial-value="initialValue" @change="handleChange">
      <Editable
        aria-label="Input events editor"
        :render-element="renderElement"
        style="border: 1px solid #ccc; padding: 0 8px"
      />
    </Slate>
    <div style="display: flex; gap: 8px; margin: 16px 0 8px">
      <button type="button" @click="copyLog">Copy log</button>
      <button type="button" @click="clearLog">Clear log</button>
    </div>
    <textarea
      ref="logRef"
      aria-label="Input event log"
      readonly
      :value="log"
      style="
        width: 100%;
        min-height: 240px;
        font-family: monospace;
        font-size: 12px;
      "
    />
  </div>
</template>
