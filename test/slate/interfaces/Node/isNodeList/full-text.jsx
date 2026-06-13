import { Node } from "slate-vue3/core";

export const input = [
  {
    text: "",
  },
];
export const test = (value) => {
  return Node.isNodeList(value);
};
export const output = true;
