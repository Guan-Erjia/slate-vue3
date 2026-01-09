import { Node } from "slate";

export const input = {
  text: "",
};
export const test = (value) => {
  return Node.isText(value);
};
export const output = true;
