import { orderBy } from 'lodash'

import { Filter, JsonFilter, MatchFilter, ObjectPathFilter } from './filters'
import { AccessPass, CheckResult } from './AccessPass'

export type Filters = {
  [name: string]: new (args: string[]) => Filter
}

type Options = {
  updateAccessPassesInterval: number
  updateAccessPassMembersInterval: number
}

export abstract class AccessPassService {
  abstract extensionFilters?: Filters

  abstract logger: any

  abstract onFetchAccessPasses(): Promise<AccessPass[]>

  private defaultFilters = {
    json: JsonFilter,
    match: MatchFilter,
    get: ObjectPathFilter,
  }

  accessPasses: AccessPass[] = []

  private options: Options

  private stopped = false

  constructor(options: Options) {
    this.options = options
  }

  get filters(): Filters {
    return {
      ...this.defaultFilters,
      ...this.extensionFilters,
    }
  }

  start(): void {
    this.stopped = false
    this.startUpdateAccessPasses()
    this.startUpdateAccessPassMembers()
  }

  stop(): void {
    this.stopped = true
  }

  startUpdateAccessPasses(): void {
    if (this.stopped) {
      return
    }

    this.updateAccessPasses()
    if (this.options.updateAccessPassesInterval) {
      setTimeout(() => {
        this.startUpdateAccessPasses()
      }, this.options.updateAccessPassesInterval)
    }
  }

  startUpdateAccessPassMembers(): void {
    if (this.stopped) {
      return
    }

    this.updateAccessPassMembers()
    if (this.options.updateAccessPassMembersInterval) {
      setTimeout(() => {
        this.startUpdateAccessPassMembers()
      }, this.options.updateAccessPassMembersInterval)
    }
  }

  updateAccessPasses(): void {
    this.onFetchAccessPasses()
      .then(passes => {
        this.accessPasses = orderBy(passes, ['priority'], ['desc'])
        this.accessPasses.forEach(it => {
          try {
            it.parseFilter(this.filters)
          } catch (e) {
            this.logger.error('parse filter error', {
              accessMemberName: it.name,
              accessMemberFilter: it.filter,
              error: e,
            })
          }
          it.updateMembers().catch(e => {
            this.logger.error('update pass members error', {
              accessMemberName: it.name,
              error: e,
            })
          })
        })
      })
      .catch(e => {
        this.logger.error('fetch access passes error', e)
      })
  }

  updateAccessPassMembers(): void {
    this.accessPasses.forEach(it => {
      it.updateMembers()
        .catch(e => {
          this.logger.error('update access pass member error', {
            error: e,
            accessMemberName: it.name,
          })
        })
    })
  }

  async check(request: unknown): Promise<CheckResult> {
    for (const accessPass of this.accessPasses) {
      const checkResult = await accessPass.check(request)
      if (checkResult === CheckResult.Skip) {
        return CheckResult.Skip
      }
      if (checkResult === CheckResult.Deny) {
        return CheckResult.Deny
      }
    }
    return CheckResult.Pass
  }
}
