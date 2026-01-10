import { Location, Path } from "slate";

export const input = [];
export const test = (value) => {
  return Location.isPath(value);
};
export const output = true;
