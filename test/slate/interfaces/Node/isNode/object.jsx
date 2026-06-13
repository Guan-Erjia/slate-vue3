import { Node } from "slate-vue3/core";

export const input = {};
export const test = (value) => {
  return Node.isNode(value);
};
export const output = false;
