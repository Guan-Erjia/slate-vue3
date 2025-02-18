import { isDeepEqual } from '@test-utils'

export const input = {
  objectA: {
    text: 'same text',
    bold: true,
    italic: { origin: 'inherited', value: false },
  },
  objectB: {
    text: 'same text',
    bold: true,
    italic: { origin: 'inherited', value: false },
  },
}

export const test = ({ objectA, objectB }) => {
  return isDeepEqual(objectA, objectB)
}

export const output = true
