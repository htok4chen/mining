const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/security');

module.exports = (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: '请先登录' });
  try {
    const payload = jwt.verify(token, jwtSecret);
    if (payload.role !== 'user') return res.status(403).json({ message: '权限不足' });
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: '登录已过期，请重新登录' });
  }
};
