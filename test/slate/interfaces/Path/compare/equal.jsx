import { Path } from "slate-vue3/core";

export const input = {
  path: [0, 1, 2],
  another: [0, 1, 2],
};
export const test = ({ path, another }) => {
  return Path.compare(path, another);
};
export const output = 0;
