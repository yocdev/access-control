import { Filter } from './Filter'
import { ObjectPathFilter } from './ObjectPathFilter'
import { JsonFilter } from './JsonFilter'
import { MatchFilter } from './MatchFilter'

describe('Filter', () => {
  let filter: Filter

  describe('ObjectPathFilter', () => {
    beforeEach(() => {
      filter = new ObjectPathFilter(['path.foo'])
    })

    it('.name is get', () => {
      expect(filter.name).toEqual('get')
    })

    describe('.filter', () => {
      describe('当参数是 object 时', () => {
        it('returns right', () => {
          const r = filter.filter({ path: { foo: 'bar' } })
          expect(r).toEqual('bar')
        })
      })
      describe('当参数不是 object 时', () => {
        it('returns null', () => {
          const r = filter.filter('abc')
          expect(r).toEqual(null)
        })
      })
    })
  })

  describe('JsonFilter', () => {
    beforeEach(() => {
      filter = new JsonFilter([])
    })

    it('.name is "json"', () => {
      expect(filter.name).toEqual('json')
    })

    describe('.filter', () => {
      describe('当参数是 json 字符串时', () => {
        it('returns right', () => {
          expect(filter.filter('{ "a": [1] }')).toEqual({ a: [1] })
        })
      })

      describe('当参数不是 json 字符串时', () => {
        it('returns null', () => {
          expect(filter.filter('{ a: [1] }')).toEqual(null)
        })
      })

      describe('当参数不是 string 时', () => {
        it('returns null', () => {
          expect(filter.filter({})).toEqual(null)
        })
      })
    })
  })

  describe('MatchFilter', () => {
    beforeEach(() => {
      filter = new MatchFilter(['a(b)c'])
    })

    it('.name is "match"', () => {
      expect(filter.name).toEqual('match')
    })

    describe('.filter', () => {
      describe('当参数不是 string 时', () => {
        it('returns null', () => {
          expect(filter.filter({})).toEqual(null)
        })
      })

      describe('当匹配上时', () => {
        it('returns right', () => {
          expect(filter.filter('abc')).toEqual('b')
        })
      })

      describe('当没有匹配上时', () => {
        it('returns null', () => {
          expect(filter.filter('aaa')).toEqual(null)
        })
      })
    })
  })
})
