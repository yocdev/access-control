import { difference } from 'lodash'
import { Filter } from './filters'

export type AccessPassType = {
  name: string
  key: string
  filter: string
}

export type PromiseOrValue<T> = Promise<T> | T

export abstract class AccessPass<Request> implements AccessPassType {
  filter: string

  key: string

  name: string

  filters: Filter[] = []

  readonly isAsync: boolean

  protected members: string[] = []

  constructor(initial: AccessPassType, isAsync: boolean) {
    const { filter, key, name } = initial
    this.name = name
    this.filter = filter
    this.key = key
    this.isAsync = isAsync
  }

  abstract updateMembers(): Promise<void>

  getMembers(): PromiseOrValue<string[]> {
    if (this.isAsync) {
      return Promise.resolve(this.members)
    }
    return this.members
  }

  hasMember(member: string): PromiseOrValue<boolean> {
    if (this.isAsync) {
      return Promise.resolve(this.members.includes(member))
    }
    return this.members.includes(member)
  }

  addMembers(members: string[]): PromiseOrValue<void> {
    members.forEach(it => {
      this.members.push(it)
    })
    if (this.isAsync) {
      return Promise.resolve()
    }
    return undefined
  }

  removeMembers(members: string[]): PromiseOrValue<void> {
    this.members = difference(this.members, members)
    if (this.isAsync) {
      return Promise.resolve()
    }
    return undefined
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

  check(request: Request): PromiseOrValue<boolean> {
    if (this.filters.length === 0) {
      if (this.isAsync) {
        return Promise.resolve(false)
      }
      return false
    }
    let value: unknown = request
    for (const filter of this.filters) {
      value = filter.filter(value)
    }
    if (value) {
      return this.hasMember(value as string)
    }
    if (this.isAsync) {
      return Promise.resolve(false)
    }
    return false
  }
}
