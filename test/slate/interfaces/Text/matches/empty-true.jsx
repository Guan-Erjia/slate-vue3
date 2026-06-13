import { Text } from "slate-vue3/core";

export const input = {
  text: { text: "", bold: true },
  props: {},
};
export const test = ({ text, props }) => {
  return Text.matches(text, props);
};
export const output = true;
