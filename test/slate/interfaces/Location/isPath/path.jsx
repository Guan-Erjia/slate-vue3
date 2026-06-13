import { Location, Path } from "slate-vue3/core";

export const input = [0, 1];
export const test = (value) => {
  return Location.isPath(value);
};
export const output = true;
