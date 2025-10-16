import { isDeepEqual } from "@test-utils";

export const input = {
  objectA: {
    text: "same text",
  },
  objectB: {
    text: "same text",
    bold: undefined,
  },
};

export const test = ({ objectA, objectB }) => {
  return isDeepEqual(objectA, objectB);
};

export const output = true;
