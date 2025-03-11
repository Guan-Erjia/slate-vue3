import { Path } from 'slate'

export type StringDiff = {
  start: number
  end: number
  text: string
}

export type TextDiff = {
  id: number
  path: Path
  diff: StringDiff
}

export function applyStringDiff(text: string, ...diffs: StringDiff[]) {
  return diffs.reduce(
    (text, diff) =>
      text.slice(0, diff.start) + diff.text + text.slice(diff.end),
    text
  )
}

function longestCommonPrefixLength(str: string, another: string) {
  const length = Math.min(str.length, another.length)

  for (let i = 0; i < length; i++) {
    if (str.charAt(i) !== another.charAt(i)) {
      return i
    }
  }

  return length
}

function longestCommonSuffixLength(
  str: string,
  another: string,
  max: number
): number {
  const length = Math.min(str.length, another.length, max)

  for (let i = 0; i < length; i++) {
    if (
      str.charAt(str.length - i - 1) !== another.charAt(another.length - i - 1)
    ) {
      return i
    }
  }

  return length
}

/**
 * Remove redundant changes from the diff so that it spans the minimal possible range
 */
export function normalizeStringDiff(targetText: string, diff: StringDiff) {
  const { start, end, text } = diff
  const removedText = targetText.slice(start, end)

  const prefixLength = longestCommonPrefixLength(removedText, text)
  const max = Math.min(
    removedText.length - prefixLength,
    text.length - prefixLength
  )
  const suffixLength = longestCommonSuffixLength(removedText, text, max)

  const normalized: StringDiff = {
    start: start + prefixLength,
    end: end - suffixLength,
    text: text.slice(prefixLength, text.length - suffixLength),
  }

  if (normalized.start === normalized.end && normalized.text.length === 0) {
    return null
  }

  return normalized
}

