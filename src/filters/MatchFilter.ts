import { Filter } from './Filter'

export class MatchFilter extends Filter {
  private readonly regExp: RegExp

  constructor(args: string[]) {
    super('match', args)
    this.regExp = new RegExp(args[0])
  }

  filter(value: unknown): unknown {
    if (this.isString(value)) {
      const match = value.match(this.regExp)
      if (match) {
        return match[1] || null
      }
    }
    return null
  }
}
