import { Location, Path } from "slate";

export const input = [0, 1];
export const test = (value) => {
  return Location.isPoint(value);
};
export const output = false;
