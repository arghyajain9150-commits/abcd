/**
 * Simple in-memory sliding-window rate limiter middleware
 */
export function createRateLimiter({ windowMs = 60_000, maxRequests = 30, message = 'Too many requests, please try again later.' }) {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    const clientData = requests.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
    } else {
      clientData.count += 1;
    }

    requests.set(ip, clientData);

    // Periodically clean up stale records
    if (requests.size > 5000) {
      for (const [key, data] of requests.entries()) {
        if (now > data.resetTime) requests.delete(key);
      }
    }

    if (clientData.count > maxRequests) {
      const retryAfter = Math.ceil((clientData.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({ error: message, retryAfterSeconds: retryAfter });
    }

    next();
  };
}

export const authLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
  message: 'Too many authentication attempts. Please wait 1 minute before trying again.'
});

export const aiLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 25,
  message: 'Gemini AI symptom triage request limit reached. Please wait a minute.'
});

export const ticketLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 10,
  message: 'Too many tickets submitted in a short period.'
});
