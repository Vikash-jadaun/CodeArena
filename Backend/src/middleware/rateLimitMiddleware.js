const redisClient = require('../config/redis');

const createRateLimiter = ({ keyPrefix, maxRequests, windowSeconds }) => async (req, res, next) => {
  const userId = req.result?._id?.toString();

  if (!userId) {
    return res.status(401).json({ message: 'Authenticated user is required' });
  }

  const key = `rate-limit:${keyPrefix}:${userId}`;

  try {
    const result = await redisClient.multi()
      .incr(key)
      .expire(key, windowSeconds, 'NX')
      .exec();
    const requestCount = Number(result[0]);

    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(Math.max(maxRequests - requestCount, 0)));

    if (requestCount > maxRequests) {
      return res.status(429).json({
        message: 'Too many requests. Please try again later.'
      });
    }

    return next();
  } catch (error) {
    console.error('Redis rate limit check failed:', error.message);
    return res.status(503).json({
      message: 'Rate limiting service is temporarily unavailable'
    });
  }
};

const codeSubmissionRateLimit = createRateLimiter({
  keyPrefix: 'code-submission',
  maxRequests: 10,
  windowSeconds: 60
});

const aiRequestRateLimit = createRateLimiter({
  keyPrefix: 'ai-tutor',
  maxRequests: 15,
  windowSeconds: 60
});

module.exports = {
  codeSubmissionRateLimit,
  aiRequestRateLimit
};
