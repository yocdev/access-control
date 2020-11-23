import { AccessPassService, Filters } from './AccessPassService'
import { AccessPass, CheckResult } from './AccessPass'
import { Filter } from './filters'

class FilterTest extends Filter {
  constructor(args: string[]) {
    super('test', args)
  }

  filter(value: unknown): unknown {
    return value
  }
}

class AccessPassTest extends AccessPass {
  updateMembers(): Promise<void> {
    this.members = ['1', '2', '3']
    return Promise.resolve()
  }
}

class AccessPassServiceTest extends AccessPassService {
  extensionFilters?: Filters

  logger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  }

  onFetchAccessPasses(): Promise<AccessPass[]> {
    return Promise.resolve([
      new AccessPassTest({
        name: '黑名单',
        filter: 'get user.name',
        priority: 0,
        checkResult: CheckResult.Deny,
        key: 'sdr:blackList',
      }),
      new AccessPassTest({
        name: '白名单',
        filter: 'get user.name',
        priority: 10,
        checkResult: CheckResult.Skip,
        key: 'sdr:whiteList',
      }),
    ])
  }
}

describe('AccessPassService', () => {
  let service: AccessPassService

  beforeEach(() => {
    service = new AccessPassServiceTest({
      updateAccessPassMembersInterval: 1000,
      updateAccessPassesInterval: 1000,
    })
  })

  describe('.filters', () => {
    it('returns default filters', () => {
      const filterNames = Object.values(service.filters)
        .map(Filter => new Filter([]).name)
      expect(filterNames).toEqual(['json', 'match', 'get'])
    })

    it('returns extensionFilters', () => {
      service.extensionFilters = {
        test: FilterTest,
      }

      const filterNames = Object.values(service.filters)
        .map(Filter => new Filter([]).name)
      expect(filterNames).toEqual(['json', 'match', 'get', 'test'])
    })
  })

  describe('.updateAccessPasses', () => {
    beforeEach(() => {
      service.updateAccessPasses()
    })

    it('updates accessPasses and sorts accessPasses with priority', () => {
      expect(service.accessPasses.map(it => it.name)).toEqual(['白名单', '黑名单'])
    })
  })

  describe('.updateAccessPassMembers', () => {
    beforeEach(done => {
      service.updateAccessPasses()
      setTimeout(() => {
        service.updateAccessPassMembers()
        done()
      }, 100)
    })

    it('updates accessPass.members', async () => {
      const members = await service.accessPasses[0].getMembers()
      expect(members).toEqual(['1', '2', '3'])
    })
  })

  describe('.check', () => {
    beforeEach(done => {
      service.updateAccessPasses()
      setTimeout(() => {
        service.updateAccessPassMembers()
        done()
      }, 100)
    })
    it('returns right', async () => {
      const result = await service.check({
        user: {
          name: '1',
        },
      })
      expect(result).toEqual(CheckResult.Skip)
    })
  })
})
