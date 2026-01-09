import { Node } from "slate";

export const input = {};
export const test = (value) => {
  return Node.isText(value);
};
export const output = false;
