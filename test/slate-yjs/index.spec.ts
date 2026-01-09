import { resolveModules } from "@test-utils";
import { test, expect, describe } from "vitest";
import {
  withYjs,
  yTextToSlateElement,
  slateNodesToInsertDelta,
} from "slate-yjs";
import * as Y from "yjs";
import { Editor, createEditor, Element, Transforms } from "slate";

const modules = await resolveModules(import.meta.glob("./**/*.jsx"));

const INLINE_ELEMENTS = ["note-link", "link"];

const sleep = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

async function withTestingElements(editor: Editor, doc = new Y.Doc()) {
  const { normalizeNode, isInline } = editor;
  editor.normalizeNode = (entry) => {
    const [node, path] = entry;
    if (Element.isElement(node) && (node as any).type === "unordered-list") {
      if (!node.children.length) {
        return Transforms.removeNodes(editor, { at: path });
      }
    }
    normalizeNode(entry);
  };

  editor.isInline = (element) =>
    INLINE_ELEMENTS.includes((element as any).type) || isInline(element);

  const sharedType = doc.get("sharedRoot", Y.XmlText);
  if (sharedType.toDelta().length === 0) {
    sharedType.applyDelta(slateNodesToInsertDelta(editor.children));
  }

  const e = withYjs(editor, sharedType, { autoConnect: true });
  await sleep();

  return e;
}

async function normalizedSlateDoc(sharedRoot: Y.XmlText) {
  const editor = createEditor();
  editor.children = yTextToSlateElement(sharedRoot).children;
  const e = await withTestingElements(editor);
  Editor.normalize(e, { force: true });
  return e.children;
}

describe("slate-yjs", () => {
  modules.forEach((module) => {
    const { input, expected, run, path } = module;
    test(path, async () => {
      // Setup 'local' editor
      const editor = await withTestingElements(input);

      // Keep the 'local' editor state before applying run.
      const baseState = Y.encodeStateAsUpdateV2(editor.sharedRoot.doc!);

      Editor.normalize(editor, { force: true });

      // The normalized editor state should match the shared root.
      expect(await normalizedSlateDoc(editor.sharedRoot)).toStrictEqual(
        editor.children,
      );

      run(editor);
      editor.onChange();

      // Editor state after run should match shared root.
      expect(await normalizedSlateDoc(editor.sharedRoot)).toStrictEqual(
        editor.children,
      );

      // Setup remote editor with input base state
      const remoteDoc = new Y.Doc();
      Y.applyUpdateV2(remoteDoc, baseState);
      const remote = await withTestingElements(createEditor(), remoteDoc);

      // Apply changes from 'run'
      Y.applyUpdateV2(
        remoteDoc,
        Y.encodeStateAsUpdateV2(editor.sharedRoot.doc!),
      );

      // Verify remote and editor state are equal
      expect(await normalizedSlateDoc(remote.sharedRoot)).toStrictEqual(
        remote.children,
      );
      expect(editor.children).toEqual(remote.children);
      expect(await normalizedSlateDoc(editor.sharedRoot)).toStrictEqual(
        editor.children,
      );

      // Verify editor is in expected state
      const expectedEditor = await withTestingElements(expected);
      Editor.normalize(expectedEditor, { force: true });
      expect(editor.children).toStrictEqual(expectedEditor.children);
    });
  });
});
