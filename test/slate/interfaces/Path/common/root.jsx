import { Path } from "slate-vue3/core";

export const input = {
  path: [0, 1, 2],
  another: [3, 2],
};
export const test = ({ path, another }) => {
  return Path.common(path, another);
};
export const output = [];
