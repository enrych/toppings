import { expect } from 'chai'
import { getWebAppInfo } from '../../../src/background/webAppInfo'

describe('getWebAppInfo', () => {
  it('should return correct info for a supported YouTube playlist URL', () => {
    const testCase1 = 'https://www.youtube.com/playlist?list=PL1234567890'
    const expectedResult1 = {
      status: 'supported',
      appName: 'youtube',
      details: {
        routeType: 'playlist',
        contentId: 'PL1234567890',
        queryParams: {
          list: 'PL1234567890'
        }
      }
    }
    expect(getWebAppInfo(testCase1)).to.deep.equal(expectedResult1)
  })

  it('should return correct info for a supported YouTube video URL', () => {
    const testCase2 = 'https://www.youtube.com/watch?v=ABCDEFGHIJK'
    const expectedResult2 = {
      status: 'supported',
      appName: 'youtube',
      details: {
        routeType: 'watch',
        contentId: 'ABCDEFGHIJK',
        queryParams: {
          v: 'ABCDEFGHIJK'
        }
      }
    }
    expect(getWebAppInfo(testCase2)).to.deep.equal(expectedResult2)
  })

  it('should return unsupported for an unsupported URL', () => {
    const testCase3 = 'https://example.com'
    const expectedResult3 = { status: 'unsupported' }
    expect(getWebAppInfo(testCase3)).to.deep.equal(expectedResult3)
  })
})
