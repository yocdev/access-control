import { get } from 'lodash'
import { Filter } from './Filter'

export class ObjectPathFilter extends Filter {
  constructor(args: string[]) {
    super('get', args)
  }

  filter(value: unknown): unknown {
    const [path] = this.args
    if (this.isObject(value)) {
      return get(value, path)
    }
    return null
  }
}
