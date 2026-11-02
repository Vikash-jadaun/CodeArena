const redisClient = require('../config/redis');

const CACHE_TTL_SECONDS = 10 * 60;
const PROBLEM_LIST_KEY = 'cache:problems:list';

const getProblemCacheKey = (problemId) => `cache:problems:detail:${problemId}`;

const cacheResponse = (key) => async (req, res, next) => {
  try {
    const cachedValue = await redisClient.get(key(req));

    if (cachedValue) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json(JSON.parse(cachedValue));
    }

    res.set('X-Cache', 'MISS');
  } catch (error) {
    console.error('Redis cache read failed:', error.message);
    res.set('X-Cache', 'BYPASS');
  }

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  const storeResponse = (body) => {
    if (res.statusCode < 200 || res.statusCode >= 300 || body === undefined) {
      return;
    }

    redisClient
      .set(key(req), JSON.stringify(body), { EX: CACHE_TTL_SECONDS })
      .catch((error) => console.error('Redis cache write failed:', error.message));
  };

  res.json = (body) => {
    storeResponse(body);
    return originalJson(body);
  };

  res.send = (body) => {
    if (typeof body !== 'string' && !Buffer.isBuffer(body)) {
      storeResponse(body);
    }
    return originalSend(body);
  };

  return next();
};

const cacheProblemList = cacheResponse(() => PROBLEM_LIST_KEY);
const cacheProblemDetails = cacheResponse((req) => getProblemCacheKey(req.params.id));

const invalidateProblemCache = (includeProblemId = false) => (req, res, next) => {
  res.once('finish', async () => {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return;
    }

    const keys = [PROBLEM_LIST_KEY];
    if (includeProblemId && req.params.id) {
      keys.push(getProblemCacheKey(req.params.id));
    }

    try {
      await redisClient.del(...keys);
    } catch (error) {
      console.error('Redis cache invalidation failed:', error.message);
    }
  });

  next();
};

module.exports = {
  cacheProblemList,
  cacheProblemDetails,
  invalidateProblemCache
};
