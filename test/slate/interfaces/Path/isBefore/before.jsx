import { Path } from "slate-vue3/core";

export const input = {
  path: [0, 1, 2],
  another: [1],
};
export const test = ({ path, another }) => {
  return Path.isBefore(path, another);
};
export const output = true;
