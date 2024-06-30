/**
 * Formats the runtime seconds into a human-readable string.
 *
 * @param {number} seconds - The seconds in the runtime.
 * @returns {string} - A formatted string representing the runtime.
 */
 export const formatRuntime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400); // 1 day = 24 hours * 60 minutes * 60 seconds
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];

  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  }

  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }

  if (remainingSeconds > 0) {
    parts.push(`${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`);
  }

  if (parts.length === 0) {
    parts.push('0 seconds');
  }

  return parts.join(', ');
};

