import { isCustomOperation } from './type-guards'

export const input = {
  type: 'insert_text',
  path: [0, 0],
  offset: 0,
  text: 'text',
}

export const test = isCustomOperation

export const output = false
