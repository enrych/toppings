import { expect } from 'chai'
import { formatRuntime } from '../../../../src/content_scripts/utils/formatRuntime'

describe('formatRuntime', () => {
  it('should format runtime with days, hours, minutes, and seconds', () => {
    const runtime = { days: 2, seconds: 7385 } // 2 days, 2 hours, 3 minutes, and 5 seconds
    const result = formatRuntime(runtime)
    expect(result).to.equal('2 days, 2 hours, 3 minutes, 5 seconds')
  })

  it('should format runtime with hours, minutes, and seconds', () => {
    const runtime = { days: 0, seconds: 3725 } // 1 hour, 2 minutes, and 5 seconds
    const result = formatRuntime(runtime)
    expect(result).to.equal('1 hour, 2 minutes, 5 seconds')
  })

  it('should format runtime with minutes and seconds', () => {
    const runtime = { days: 0, seconds: 185 } // 3 minutes and 5 seconds
    const result = formatRuntime(runtime)
    expect(result).to.equal('3 minutes, 5 seconds')
  })

  it('should format runtime with seconds', () => {
    const runtime = { days: 0, seconds: 45 } // 45 seconds
    const result = formatRuntime(runtime)
    expect(result).to.equal('45 seconds')
  })

  it('should format runtime with 0 seconds', () => {
    const runtime = { days: 0, seconds: 0 } // 0 seconds
    const result = formatRuntime(runtime)
    expect(result).to.equal('0 seconds')
  })

  it('should handle singular and plural units correctly', () => {
    const runtime = { days: 1, seconds: 3665 } // 1 day, 1 hour, 1 minute, and 5 seconds
    const result = formatRuntime(runtime)
    expect(result).to.equal('1 day, 1 hour, 1 minute, 5 seconds')
  })
})
