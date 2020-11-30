import { orderBy } from 'lodash'

import { Filter, JsonFilter, MatchFilter, ObjectPathFilter } from './filters'
import { AccessPass } from './AccessPass'
import { CheckResultHandler } from './CheckResultHandler'

export type Filters = {
  [name: string]: new (args: string[]) => Filter
}

type Options = {
  updateAccessPassesInterval: number
  updateAccessPassMembersInterval: number
  updateCheckResultHandlersInterval: number
}

type LogFunction = (...args: unknown[]) => void

export type Logger = {
  trace: LogFunction
  debug: LogFunction
  info: LogFunction
  warn: LogFunction
  error: LogFunction
  fatal: LogFunction
}

export abstract class AccessPassService<Request, Response> {
  abstract extensionFilters?: Filters

  abstract logger: Logger

  abstract getAccessPasses(): Promise<AccessPass<Request>[]>

  abstract getCheckResultHandlers(): Promise<CheckResultHandler<Request, Response>[]>

  private defaultFilters = {
    json: JsonFilter,
    match: MatchFilter,
    get: ObjectPathFilter,
  }

  accessPasses: AccessPass<Request>[] = []

  checkResultHandlers: CheckResultHandler<Request, Response>[] = []

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

  startUpdateCheckResultHandlers(): void {
    if (this.stopped) {
      return
    }

    this.updateCheckResultHandlers()
    if (this.options.updateCheckResultHandlersInterval) {
      setTimeout(() => {
        this.startUpdateCheckResultHandlers()
      }, this.options.updateCheckResultHandlersInterval)
    }
  }

  updateAccessPasses(): void {
    this.getAccessPasses()
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

  updateCheckResultHandlers(): void {
    this.getCheckResultHandlers()
      .then(handlers => {
        this.checkResultHandlers = handlers
      })
      .catch(e => {
        this.logger.error('update check result handlers error', e)
      })
  }

  async check(request: Request, response: Response): Promise<boolean> {
    const checkResult: { [key: string]: boolean } = {}
    const checked: Promise<{ key: string, result: boolean}>[] = []
    for (const accessPass of this.accessPasses) {
      checked.push(accessPass.check(request).then(result => ({ key: accessPass.key, result })))
    }
    const results = await Promise.all(checked)
    results.forEach(({ key, result }) => {
      checkResult[key] = result
    })

    const handleResults: Promise<boolean>[] = []
    for (const handler of this.checkResultHandlers) {
      handleResults.push(handler.handle(request, response, checkResult))
    }

    return Promise.all(handleResults).then(it => it.some(Boolean))
  }
}
