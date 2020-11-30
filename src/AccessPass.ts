import { difference } from 'lodash'
import { Filter } from './filters'

export type AccessPassType = {
  name: string
  key: string
  filter: string
}

export abstract class AccessPass<Request> implements AccessPassType {
  filter: string

  key: string

  name: string

  filters: Filter[] = []

  protected members: string[] = []

  constructor(initial: AccessPassType) {
    const { filter, key, name } = initial
    this.name = name
    this.filter = filter
    this.key = key
  }

  abstract updateMembers(): Promise<void>

  getMembers(): Promise<string[]> {
    return Promise.resolve(this.members)
  }

  hasMember(member: string): Promise<boolean> {
    return Promise.resolve(this.members.includes(member))
  }

  addMembers(members: string[]): Promise<void> {
    members.forEach(it => {
      this.members.push(it)
    })
    return Promise.resolve()
  }

  removeMembers(members: string[]): Promise<void> {
    this.members = difference(this.members, members)
    return Promise.resolve()
  }

  parseFilter(allFilters: { [name: string]: new (args: string[]) => Filter }): void {
    const filters: Filter[] = []
    this.filter.split('|').forEach(it => {
      const [name, ...args] = it.trim().split(' ')
      const Filter = allFilters[name]
      if (Filter) {
        filters.push(new Filter(args))
      }
    })
    this.filters = filters
  }

  check(request: Request): Promise<boolean> {
    if (this.filters.length === 0) {
      return Promise.resolve(false)
    }
    let value: unknown = request
    for (const filter of this.filters) {
      value = filter.filter(value)
    }
    if (value) {
      return this.hasMember(value as string)
    }
    return Promise.resolve(false)
  }
}
