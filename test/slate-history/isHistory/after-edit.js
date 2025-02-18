import { Transforms } from "slate-vue";

export const run = (editor) => {
  Transforms.insertText(editor, "additional text");
};
