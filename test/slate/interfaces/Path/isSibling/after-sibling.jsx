import { Path } from "slate-vue3/core";

export const input = {
  path: [1, 4],
  another: [1, 2],
};
export const test = ({ path, another }) => {
  return Path.isSibling(path, another);
};
export const output = true;
