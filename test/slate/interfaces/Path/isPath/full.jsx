import { Path } from "slate-vue3/core";

export const input = [0, 1];
export const test = (path) => {
  return Path.isPath(path);
};
export const output = true;
