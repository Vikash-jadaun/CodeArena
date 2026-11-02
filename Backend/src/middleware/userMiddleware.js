const jwt = require('jsonwebtoken');
const User = require('../modules/user');
const redisClient = require('../config/redis');

const userMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const cookieToken = req.cookies?.token;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : cookieToken;

    if (!token) {
      return res.status(401).json({ message: 'Token is required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = payload;

    if (!_id) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const result = await User.findById(_id);
    if (!result) {
      return res.status(401).json({ message: "User doesn't exist" });
    }

    const isBlocked = await redisClient.exists(`token:${token}`);
    if (Number(isBlocked) > 0) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.result = result;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ message: err.message || 'Authentication failed' });
  }
};

module.exports = userMiddleware;