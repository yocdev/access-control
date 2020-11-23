import { isString, isObject } from 'lodash'

export abstract class Filter {
  name: string

  args: string[]

  protected constructor(name: string, args: string[]) {
    this.name = name
    this.args = args
  }

  abstract filter(value: unknown): unknown

  protected isString(value: unknown): value is string {
    return isString(value)
  }

  protected isObject(value: unknown): value is any {
    return isObject(value)
  }
}
