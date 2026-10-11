/**
 * Sliding window rate-limiter for Cloud Functions
 */

const userRequestLogs = new Map();

/**
 * Check if a user has exceeded rate limits.
 * @param {string} uid - User ID
 * @param {number} maxRequests - Max requests allowed in window (default: 15)
 * @param {number} windowMs - Window duration in milliseconds (default: 60,000ms / 1 min)
 * @returns {{ allowed: boolean, remaining: number, resetInMs: number }}
 */
function checkRateLimit(uid, maxRequests = 15, windowMs = 60000) {
  const now = Date.now();
  if (!userRequestLogs.has(uid)) {
    userRequestLogs.set(uid, []);
  }

  const timestamps = userRequestLogs.get(uid).filter(ts => now - ts < windowMs);
  userRequestLogs.set(uid, timestamps);

  if (timestamps.length >= maxRequests) {
    const oldestTimestamp = timestamps[0];
    const resetInMs = windowMs - (now - oldestTimestamp);
    return {
      allowed: false,
      remaining: 0,
      resetInMs
    };
  }

  timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - timestamps.length,
    resetInMs: windowMs
  };
}

module.exports = {
  checkRateLimit
};
