const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: '未登录' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
    next();
  } catch (e) {
    return res.status(401).json({ message: '登录已过期，请重新登录' });
  }
};
