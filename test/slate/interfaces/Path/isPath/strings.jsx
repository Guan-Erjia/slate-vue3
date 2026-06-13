import { Path } from "slate-vue3/core";

export const input = ["a", "b"];
export const test = (path) => {
  return Path.isPath(path);
};
export const output = false;
