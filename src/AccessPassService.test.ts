import { AccessPassService, Filters } from './AccessPassService'
import { AccessPass } from './AccessPass'
import { AccessPassResults, CheckResultHandler } from './CheckResultHandler'

type Request = any
type Response = {
  send: (data: any) => void
}

class AccessPassServiceTest extends AccessPassService<Request, Response> {
  extensionFilters?: Filters

  mockFetchAccessPasses = jest.fn()

  mockFetchCheckResultHandlers = jest.fn()

  logger: any = {
    error: jest.fn(),
  }

  getAccessPasses(): Promise<AccessPass<Request>[]> {
    return this.mockFetchAccessPasses()
  }

  getCheckResultHandlers(): Promise<CheckResultHandler<Request, Response>[]> {
    return this.mockFetchCheckResultHandlers()
  }
}

class AccessPassTest extends AccessPass<Request> {
  mockMembers = jest.fn()

  async updateMembers(): Promise<void> {
    this.members = await this.mockMembers()
  }
}

class CheckResultHandlerTest extends CheckResultHandler<Request, Response> {
  mockHandle = jest.fn()

  handle(
    request: Request, response: Response, accessPassResults: AccessPassResults,
  ): Promise<boolean> {
    return this.mockHandle(request, response, accessPassResults)
  }
}

describe('AccessPassService', () => {
  let service: AccessPassServiceTest
  let request: Request
  let response: Response

  let blackList: AccessPassTest
  let whiteList: AccessPassTest

  let handler1: CheckResultHandlerTest
  let handler2: CheckResultHandlerTest

  beforeEach(() => {
    request = {}

    response = {
      send: jest.fn(),
    }

    blackList = new AccessPassTest({
      name: '黑名单',
      key: 'blackList',
      filter: 'get user.name',
    })
    blackList.mockMembers.mockResolvedValue([])

    whiteList = new AccessPassTest({
      name: '白名单',
      key: 'whiteList',
      filter: 'get user.name',
    })
    whiteList.mockMembers.mockResolvedValue([])

    handler1 = new CheckResultHandlerTest()
    handler2 = new CheckResultHandlerTest()

    service = new AccessPassServiceTest({
      updateCheckResultHandlersInterval: 1000,
      updateAccessPassesInterval: 1000,
      updateAccessPassMembersInterval: 1000,
    })
  })

  describe('.check', () => {
    describe('当没有 AccessPass 的时候', () => {
      it('returns false', async () => {
        const checkResult = await service.check(request, response)
        expect(checkResult).toEqual(false)
      })
    })

    describe('当有 AccessPass 的时候', () => {
      beforeEach(() => {
        service.mockFetchAccessPasses.mockResolvedValue([
          blackList,
          whiteList,
        ])

        service.updateAccessPasses()
      })

      describe('当 AccessPass 包含 member 时', () => {
        beforeEach(done => {
          blackList.mockMembers.mockResolvedValue(['黑'])
          service.updateAccessPassMembers()

          service.mockFetchCheckResultHandlers.mockResolvedValue([
            handler1,
            handler2,
          ])
          service.updateCheckResultHandlers()

          setTimeout(done, 1000)
        })

        it('calls handle method', async () => {
          request = {
            user: {
              name: '黑',
            },
          }

          await service.check(request, response)

          expect(handler1.mockHandle).toBeCalledWith(request, response, {
            blackList: true,
            whiteList: false,
          })
          expect(handler2.mockHandle).toBeCalledWith(request, response, {
            blackList: true,
            whiteList: false,
          })
        })

        it('returns handlers result', async () => {
          request = {
            user: {
              name: '黑',
            },
          }
          let result: boolean

          handler1.mockHandle.mockResolvedValue(false)
          handler2.mockHandle.mockResolvedValue(false)

          result = await service.check(request, response)
          expect(result).toBe(false)

          handler1.mockHandle.mockResolvedValue(true)
          handler2.mockHandle.mockResolvedValue(false)

          result = await service.check(request, response)
          expect(result).toBe(true)

          handler1.mockHandle.mockResolvedValue(false)
          handler2.mockHandle.mockResolvedValue(true)

          result = await service.check(request, response)
          expect(result).toBe(true)

          handler1.mockHandle.mockResolvedValue(true)
          handler2.mockHandle.mockResolvedValue(true)

          result = await service.check(request, response)
          expect(result).toBe(true)
        })
      })
    })
  })
})
