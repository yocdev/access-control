import { AccessPass } from './AccessPass'
import { JsonFilter, MatchFilter, ObjectPathFilter } from './filters'

class AccessPassTest extends AccessPass<any> {
  updateMembers(): Promise<void> {
    this.members = ['1', '2', '3']
    return Promise.resolve()
  }
}

describe('AccessPass', () => {
  let accessPass: AccessPass<any>

  beforeEach(() => {
    accessPass = new AccessPassTest({
      name: 'name',
      key: 'key',
      filter: 'get user.ip',
    })

    accessPass.parseFilter({
      json: JsonFilter,
      match: MatchFilter,
      get: ObjectPathFilter,
    })
  })

  describe('constructor', () => {
    it('returns right', async () => {
      expect(accessPass.name).toEqual('name')
      expect(accessPass.key).toEqual('key')
      expect(accessPass.filter).toEqual('get user.ip')
      expect(await accessPass.getMembers()).toEqual([])
    })
  })

  describe('.check', () => {
    beforeEach(() => {
      accessPass.updateMembers()
    })

    describe('当 value 是 member 时', () => {
      it('returns true', async () => {
        expect(await accessPass.check({ user: { ip: '1' } })).toEqual(true)
      })
    })

    describe('当 value 不是 member 时', () => {
      it('returns false', async () => {
        expect(await accessPass.check({ user: { ip: 'not member' } })).toEqual(false)
      })
    })
  })

  describe('.parseFilter', () => {
    beforeEach(() => {
      accessPass.filter = 'get json | json | get user.name | match a(1)c'
      accessPass.parseFilter({
        json: JsonFilter,
        match: MatchFilter,
        get: ObjectPathFilter,
      })
    })

    it('.check returns right', async () => {
      await accessPass.updateMembers()

      const request = {
        json: JSON.stringify({
          user: {
            name: 'a1c',
          },
        }),
      }
      expect(await accessPass.check(request)).toEqual(true)
    })
  })

  describe('.addMembers', () => {
    it('adds new members to members', async () => {
      await accessPass.addMembers(['a', 'b'])
      const members = await accessPass.getMembers()
      expect(members).toEqual(['a', 'b'])
    })
  })

  describe('.removeMembers', () => {
    it('removes members', async () => {
      await accessPass.addMembers(['a', 'b'])
      await accessPass.removeMembers(['a'])
      const members = await accessPass.getMembers()
      expect(members).toEqual(['b'])
    })
  })
})
