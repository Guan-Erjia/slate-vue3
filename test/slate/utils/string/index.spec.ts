import { test, expect, describe } from "vitest";
import {
  codepointsIteratorRTL,
  getCharacterDistance,
  getWordDistance,
} from "@test-utils";

const codepoints: Array<[string, number, number?]> = [
  ["a", 1],
  ["0", 1],
  [" ", 1],
  ["# ", 1],
  ["* ", 1],
  ["2 ", 1],
  ["🙂", 2],
  ["☺️", 2],
  ["☺️", 2],
  ["⬅️", 2],
  ["🏴", 2],
  ["☺️a", 2, 1],
  ["🏁🇨🇳", 2, 4],
  ["🎌🇩🇪", 2, 4],
  ["🚩🇺🇸", 2, 4],
  ["🇨🇳🎌", 4, 2],
  ["🏴🏳️", 2, 3],
  ["🇷🇺🚩", 4, 2],
];

const zwjSequences: Array<[string, number]> = [
  ["👁‍🗨", 5],
  ["👨‍👩‍👧‍👧", 11],
  ["👩‍❤️‍👨", 8],
  ["🙋🏽‍♂️", 7],
  ["🙋‍♂️", 5],
  ["🕵️‍♀️", 6],
  ["👨🏿‍🦳", 7],
];

const regionalIndicatorSequences = [
  "🇧🇪",
  "🇧🇫",
  "🇧🇬",
  "🇧🇭",
  "🇧🇮",
  "🇧🇯",
  "🇧🇱",
  "🇧🇲",
  "🇧🇳",
  "🇧🇴",
];

const keycapSequences = [
  "#️⃣",
  "*️⃣",
  "0️⃣",
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
];

const tagSequences: Array<[string, number]> = [
  ["🏴󠁧󠁢󠁥󠁮󠁧󠁿", 14],
  ["🏴󠁧󠁢󠁳󠁣󠁴󠁿", 14],
  ["🏴󠁧󠁢󠁷󠁬󠁳󠁿", 14],
];

// Sample strings from https://www.unicode.org/Public/UCD/latest/ucd/auxiliary/GraphemeBreakTest.html#samples
// In some strings, explicit Unicode code points are used to prevent accidental normalization.
// Zero-width joiners (U+200D), which are hard to tell, are also made explicit.
const sampleStrings = {
  2: ["a\u0308"],
  3: [" \u200d", "ن"],
  4: ["ن\u200d", " "],
  5: ["ᄀᄀ"],
  6: ["가\u11a8", "ᄀ"],
  7: ["각ᆨ", "ᄀ"],
  8: ["🇦🇧", "🇨", "b"],
  9: ["a", "🇦🇧", "🇨", "b"],
  10: ["a", "🇦🇧\u200d", "🇨", "b"],
  11: ["a", "🇦\u200d", "🇧🇨", "b"],
  12: ["a", "🇦🇧", "🇨🇩", "b"],
  13: ["a\u200d"],
  14: ["a\u0308", "b"],
  15: ["aः", "b"],
  16: ["a", "؀b"],
  17: ["👶🏿", "👶"],
  18: ["a🏿", "👶"],
  19: ["a🏿", "👶\u200d🛑"],
  20: ["👶🏿̈\u200d👶🏿"],
  21: ["🛑\u200d🛑"],
  22: ["a\u200d", "🛑"],
  23: ["✁\u200d✁"],
  24: ["a\u200d", "✁"],
};

const dirs = ["ltr", "rtl"];

dirs.forEach((dir) => {
  const isRTL = dir === "rtl";

  describe(`getCharacterDistance - ${dir}`, () => {
    codepoints.forEach(([str, ltrDist, rtlDist]) => {
      const dist = isRTL && rtlDist != null ? rtlDist : ltrDist;

      test(str + "", () => {
        expect(getCharacterDistance(str + str, isRTL)).toBe(dist);
      });
    });

    zwjSequences.forEach(([str, dist]) => {
      test(str + "", () => {
        expect(getCharacterDistance(str + str, isRTL)).toStrictEqual(dist);
      });
    });

    regionalIndicatorSequences.forEach((str) => {
      test(str + "", () => {
        expect(getCharacterDistance(str + str, isRTL)).toBe(4);
      });
    });

    keycapSequences.forEach((str) => {
      test(str + "", () => {
        expect(getCharacterDistance(str + str, isRTL)).toBe(3);
      });
    });

    tagSequences.forEach(([str, dist]) => {
      test(str + "", () => {
        expect(getCharacterDistance(str + str, isRTL)).toBe(dist);
      });
    });

    Object.entries(sampleStrings).forEach(([label, strs]) => {
      for (let i = 0; i < strs.length; i++) {
        let str = "";
        if (isRTL) {
          str = strs.slice(0, i + 1).join("");
        } else {
          str = strs.slice(i).join("");
        }
        test(`Sample string ${label}, boundary ${isRTL ? i : i + 1}`, () => {
          expect(getCharacterDistance(str, isRTL)).toBe(strs[i].length);
        });
      }
    });
  });
});

const ltrCases: Array<[string, number]> = [
  ["hello foobarbaz", 5],
  ["🏴󠁧󠁢󠁥󠁮󠁧󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿 🏴󠁧󠁢󠁷󠁬󠁳󠁿", 28],
  ["Don't do this", 5],
  ["I'm ok", 3],
];

const rtlCases: Array<[string, number]> = [
  ["hello foobarbaz", 9],
  ["🏴󠁧󠁢󠁥󠁮󠁧󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿 🏴󠁧󠁢󠁷󠁬󠁳󠁿", 14],
  ["Don't", 5],
  ["Don't do this", 4],
  ["I'm", 3],
  ["Tags 🏴󠁧󠁢󠁥󠁮󠁧󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿", 28],
];

describe(`getWordDistance - ltr`, () => {
  ltrCases.forEach(([str, dist]) => {
    test(str + "", () => {
      expect(getWordDistance(str)).toBe(dist);
    });
  });
});

describe(`getWordDistance - rtl`, () => {
  rtlCases.forEach(([str, dist]) => {
    test(str + "", () => {
      expect(getWordDistance(str, true)).toBe(dist);
    });
  });
});

const cases = [
  ...[...codepoints, ...zwjSequences, ...tagSequences, ...rtlCases].map(
    ([str]) => str,
  ),
  ...keycapSequences,
  ...regionalIndicatorSequences,
];

describe("codepointsIteratorRTL", () => {
  cases.forEach((str) => {
    test(str + "", () => {
      const arr1 = [...codepointsIteratorRTL(str)];
      const arr2 = Array.from(str).reverse();

      expect(arr1).toStrictEqual(arr2);
    });
  });
});
