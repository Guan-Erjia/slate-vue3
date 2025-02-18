import { isDeepEqual } from '@test-utils'

export const input = {
  objectA: { text: 'same text', bold: true },
  objectB: { text: 'same text', bold: true, italic: true },
}

export const test = ({ objectA, objectB }) => {
  return isDeepEqual(objectA, objectB)
}

export const output = false
