import { Node } from "slate-vue3/core";

export const input = {
  text: "string",
};
export const test = (value) => {
  return Node.isText(value);
};
export const output = true;
