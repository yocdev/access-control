import { Filter } from './Filter'

export class JsonFilter extends Filter {
  constructor(args: string[]) {
    super('json', args)
  }

  filter(value: unknown): unknown {
    if (this.isString(value)) {
      try {
        return JSON.parse(value)
      } catch (_) {
        return null
      }
    }
    return null
  }
}
