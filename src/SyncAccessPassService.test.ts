import { AccessPassService, Filters } from './AccessPassService'
import { AccessPass, AccessPassType } from './AccessPass'
import { CheckResultHandler } from './CheckResultHandler'

type Request = any
type Response = {
  send: (data: any) => void
}

class AccessPassTest extends AccessPass<Request> {
  updateMembers(): Promise<void> {
    return Promise.resolve(undefined)
  }
}

class SyncAccessPassServiceTest extends AccessPassService<Request, Response> {
  extensionFilters?: Filters

  getCheckResultHandlers(): Promise<CheckResultHandler<Request, Response>[]> {
    return Promise.resolve([])
  }

  getAccessPasses(): Promise<AccessPass<Request>[]> {
    return Promise.resolve([
      new AccessPassTest({
        filter: 'get name',
        name: 'name',
        key: 'test',
      }),
    ])
  }

  logger: any = {
    error: jest.fn(),
  }

  readonly isAsync: boolean = false
}

describe('SyncAccessPassService', () => {
  let service: SyncAccessPassServiceTest
  let request: Request
  let response: Response

  beforeEach(() => {
    service = new SyncAccessPassServiceTest({
      updateCheckResultHandlersInterval: 0,
      updateAccessPassesInterval: 0,
      updateAccessPassMembersInterval: 0,
    })

    request = {}
    response = {
      send: jest.fn(),
    }
  })

  describe('.check', () => {
    it('returns right', () => {
      const result = service.check(request, response)
      expect(result).toBeFalsy()
    })
  })
})
