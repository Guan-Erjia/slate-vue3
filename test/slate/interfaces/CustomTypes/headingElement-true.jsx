import { isHeadingElement } from './type-guards'

export const input = {
  type: 'heading',
  level: 5,
  children: [],
}

export const test = isHeadingElement

export const output = true
