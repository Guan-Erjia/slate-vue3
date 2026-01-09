import { Node } from "slate";

export const input = {
  text: "string",
};
export const test = (value) => {
  return Node.isText(value);
};
export const output = true;
