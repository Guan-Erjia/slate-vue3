import { Node } from "slate-vue3/core";

export const input = {
  children: [],
};
export const test = (value) => {
  return Node.isNode(value);
};
export const output = true;
