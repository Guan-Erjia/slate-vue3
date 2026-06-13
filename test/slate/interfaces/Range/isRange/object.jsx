import { Range } from "slate-vue3/core";

export const input = {};
export const test = (value) => {
  return Range.isRange(value);
};
export const output = false;
