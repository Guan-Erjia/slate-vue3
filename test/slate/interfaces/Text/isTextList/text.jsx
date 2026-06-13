import { Text } from "slate-vue3/core";

export const input = {
  text: "",
};
export const test = (value) => {
  return Text.isTextList(value);
};
export const output = false;
