/**
 * Formats a runtime object into a human-readable string.
 *
 * @param {Object} runtime - An object containing the runtime duration in days and seconds.
 * @param {number} runtime.days - The number of days in the runtime.
 * @param {number} runtime.seconds - The number of seconds in the runtime.
 * @returns {string} - A formatted string representing the runtime.
 */
export const formatRuntime = ({ days, seconds }: { days: number, seconds: number }): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  const parts = []

  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? 's' : ''}`)
  }

  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`)
  }

  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)
  }

  if (remainingSeconds > 0) {
    parts.push(`${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`)
  }

  if (parts.length === 0) {
    parts.push('0 seconds')
  }

  return parts.join(', ')
}
