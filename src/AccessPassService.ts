import { orderBy } from 'lodash'

import { Filter, JsonFilter, MatchFilter, ObjectPathFilter } from './filters'
import { AccessPass, AccessPassType } from './AccessPass'
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

  abstract fetchAccessPasses(): Promise<AccessPassType[]>

  abstract newAccessPass(accessPassInfo: AccessPassType, isAsync: boolean): AccessPass<Request>

  abstract getCheckResultHandlers(
    isAsync: boolean
  ):Promise<CheckResultHandler<Request, Response>[]>

  abstract readonly isAsync: boolean

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

  async getAccessPasses(): Promise<AccessPass<Request>[]> {
    const accessInfos = await this.fetchAccessPasses()
    return (accessInfos || []).map(info => this.newAccessPass(info, this.isAsync))
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
    this.startUpdateCheckResultHandlers()
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
    this.getCheckResultHandlers(this.isAsync)
      .then(handlers => {
        this.checkResultHandlers = handlers
      })
      .catch(e => {
        this.logger.error('update check result handlers error', e)
      })
  }

  check(request: Request, response: Response): Promise<boolean> | boolean {
    if (this.isAsync) {
      const checked: Promise<{ key: string, result: boolean}>[] = []
      for (const accessPass of this.accessPasses) {
        const checkResultPromise = accessPass.check(request) as Promise<boolean>
        checked.push(checkResultPromise.then(result => ({ key: accessPass.key, result })))
      }
      return Promise.all(checked)
        .then(results => {
          const checkResult: { [key: string]: boolean } = {}
          results.forEach(({ key, result }) => {
            checkResult[key] = result
          })
          return checkResult
        })
        .then(checkResult => {
          const handleResults: Promise<boolean>[] = []
          for (const handler of this.checkResultHandlers) {
            handleResults.push(handler.handle(request, response, checkResult) as Promise<boolean>)
          }
          return Promise.all(handleResults).then(it => it.some(Boolean))
        })
    } else {
      const checkResult: { [key: string]: boolean } = {}
      for (const accessPass of this.accessPasses) {
        checkResult[accessPass.key] = accessPass.check(request) as boolean
      }
      for (const handler of this.checkResultHandlers) {
        const handlerResult = handler.handle(request, response, checkResult) as boolean
        if (handlerResult) {
          return true
        }
      }
      return false
    }
  }
}
