import { isCustomOperation } from './type-guards'

export const input = {
  type: 'custom_op',
  value: 'some value',
}

export const test = isCustomOperation

export const output = true
