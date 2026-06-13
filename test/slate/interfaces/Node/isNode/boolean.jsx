import { Node } from "slate-vue3/core";

export const input = true;
export const test = (value) => {
  return Node.isNode(value);
};
export const output = false;
